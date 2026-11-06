-- ---------------------------------------------------------------------------
-- Server exports. Same names as the client ones, with a target first:
-- a player's server id, or -1 for everyone.
-- ---------------------------------------------------------------------------
local function target(value)
    value = tonumber(value)
    if not value then return nil end
    if value == -1 then return -1 end
    if value > 0 and GetPlayerName(value) then return value end
    return nil
end

local function emit(event, to, ...)
    to = target(to)
    if not to then return false end
    TriggerClientEvent(event, to, ...)
    return true
end

---Same as ox_lib's server `lib.notify(playerId, data)`. Also takes (target, description, type, duration, title).
exports('notify', function(to, data, notifyType, duration, title)
    if type(data) ~= 'table' then
        data = { description = data, type = notifyType, duration = duration, title = title }
    end
    return emit('bakery_notif:notify', to, data)
end)

exports('defaultNotify', function(to, data)
    if type(data) ~= 'table' then return false end
    return emit('bakery_notif:defaultNotify', to, data)
end)

exports('hide', function(to, id) return emit('bakery_notif:hide', to, id) end)
exports('clear', function(to) return emit('bakery_notif:clear', to) end)
exports('openSettings', function(to) return emit('bakery_notif:openSettings', to) end)
exports('closeSettings', function(to) return emit('bakery_notif:closeSettings', to) end)

-- ---------------------------------------------------------------------------
-- Player settings storage (Config.Storage = 'database')
-- ---------------------------------------------------------------------------
if Config.Storage ~= 'database' then return end

local MAX_PREFS_BYTES = 4096
local SAVE_COOLDOWN_MS = 2000
local dbReady = false
local lastSave = {}
local requested = {}

local function identifier(src)
    return GetPlayerIdentifierByType(src, 'license')
        or GetPlayerIdentifierByType(src, 'license2')
        or GetPlayerIdentifierByType(src, 'fivem')
end

-- Rebuild the settings from known keys only, so nothing else ever reaches the database.
local POSITIONS = {
    ['top'] = true, ['top-right'] = true, ['top-left'] = true, ['bottom'] = true, ['bottom-right'] = true,
    ['bottom-left'] = true, ['center-right'] = true, ['center-left'] = true, ['custom'] = true,
}
local SOUNDS = { none = true, blip = true, pop = true, chime = true, soft = true, alert = true, buzz = true, bell = true }
local TYPES = { 'info', 'success', 'warning', 'error' }
local STYLES = {}
for _, s in ipairs(Config.Styles) do STYLES[s] = true end

local function num(v, min, max)
    v = tonumber(v)
    if not v or v ~= v then return nil end
    return math.min(max, math.max(min, v))
end

local function bool(v)
    if type(v) == 'boolean' then return v end
    return nil
end

local function cleanPrefs(p)
    local sounds
    if type(p.sounds) == 'table' then
        sounds = {}
        for _, t in ipairs(TYPES) do
            if SOUNDS[p.sounds[t]] then sounds[t] = p.sounds[t] end
        end
    end
    return {
        style = STYLES[p.style] and p.style or nil,
        position = POSITIONS[p.position] and p.position or nil,
        customX = num(p.customX, 0, 100),
        customY = num(p.customY, 0, 100),
        forcePosition = bool(p.forcePosition),
        scale = num(p.scale, 0.7, 1.4),
        opacity = num(p.opacity, 0.4, 1),
        durationMul = num(p.durationMul, 0.5, 2.5),
        showDuration = bool(p.showDuration),
        reducedMotion = bool(p.reducedMotion),
        mute = bool(p.mute),
        volume = num(p.volume, 0, 1),
        sounds = sounds,
        dnd = bool(p.dnd),
        dndAllowErrors = bool(p.dndAllowErrors),
    }
end

CreateThread(function()
    if GetResourceState('oxmysql') == 'missing' then
        print('^3[bakery_notif]^7 Config.Storage is "database" but oxmysql is not installed. Player settings save on their PC only.')
        return
    end
    local timeout = GetGameTimer() + 30000
    while GetResourceState('oxmysql') ~= 'started' do
        if GetGameTimer() > timeout then
            print('^3[bakery_notif]^7 oxmysql did not start. Player settings save on their PC only.')
            return
        end
        Wait(250)
    end
    exports.oxmysql:query([[
        CREATE TABLE IF NOT EXISTS `bakery_notif_prefs` (
            `identifier` VARCHAR(64) NOT NULL,
            `prefs` TEXT NOT NULL,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`identifier`)
        )
    ]], {}, function()
        dbReady = true
    end)
end)

-- Once per player session: a client can't use this to hammer the database.
RegisterNetEvent('bakery_notif:requestPrefs', function()
    local src = source
    if requested[src] then return end
    requested[src] = true

    local id = identifier(src)
    if not id then return end
    CreateThread(function()
        local timeout = GetGameTimer() + 15000
        while not dbReady do
            if GetGameTimer() > timeout then return end
            Wait(250)
        end
        exports.oxmysql:scalar('SELECT `prefs` FROM `bakery_notif_prefs` WHERE `identifier` = ?', { id }, function(raw)
            if type(raw) == 'string' and #raw <= MAX_PREFS_BYTES then
                TriggerClientEvent('bakery_notif:prefs', src, raw)
            end
        end)
    end)
end)

RegisterNetEvent('bakery_notif:savePrefs', function(raw)
    local src = source
    if not dbReady or type(raw) ~= 'string' or #raw > MAX_PREFS_BYTES then return end

    local now = GetGameTimer()
    if lastSave[src] and now - lastSave[src] < SAVE_COOLDOWN_MS then return end
    lastSave[src] = now

    local ok, data = pcall(json.decode, raw)
    if not ok or type(data) ~= 'table' then return end

    local id = identifier(src)
    if not id then return end
    exports.oxmysql:update(
        'INSERT INTO `bakery_notif_prefs` (`identifier`, `prefs`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `prefs` = VALUES(`prefs`)',
        { id, json.encode(cleanPrefs(data)) }
    )
end)

AddEventHandler('playerDropped', function()
    lastSave[source] = nil
    requested[source] = nil
end)
