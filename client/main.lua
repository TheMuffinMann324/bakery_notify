local KVP_KEY = 'bakery_notif:prefs'
local MAX_PREFS_BYTES = 4096

-- ---------------------------------------------------------------------------
-- Input cleaning. Everything shown goes through here first, whoever sent it.
-- ---------------------------------------------------------------------------
local POSITIONS = {
    ['top'] = 'top', ['top-right'] = 'top-right', ['top-left'] = 'top-left',
    ['bottom'] = 'bottom', ['bottom-right'] = 'bottom-right', ['bottom-left'] = 'bottom-left',
    ['center-right'] = 'center-right', ['center-left'] = 'center-left',
    -- other frameworks' names for the same spots
    ['top-center'] = 'top', ['top-middle'] = 'top', ['middle-top'] = 'top',
    ['bottom-center'] = 'bottom', ['bottom-middle'] = 'bottom', ['middle-bottom'] = 'bottom',
    ['middle-right'] = 'center-right', ['right'] = 'center-right',
    ['middle-left'] = 'center-left', ['left'] = 'center-left',
}

local ICON_ANIMATIONS = {
    spin = true, spinPulse = true, spinReverse = true, pulse = true, beat = true,
    fade = true, beatFade = true, bounce = true, shake = true,
}

local function str(value, max)
    if value == nil then return nil end
    local t = type(value)
    if t ~= 'string' and t ~= 'number' and t ~= 'boolean' then return nil end
    value = tostring(value)
    if value == '' then return nil end
    if #value > max then value = value:sub(1, max) .. '...' end
    return value
end

-- Only plain colours (#hex, rgb(), hsl(), names). Blocks url(...) and anything else CSS can load.
local function color(value)
    if type(value) ~= 'string' or #value > 32 then return nil end
    local v = value:lower():gsub('%s', '')
    if v:match('^#%x%x%x%x?$') or v:match('^#%x%x%x%x%x%x$') or v:match('^#%x%x%x%x%x%x%x%x$')
        or v:match('^rgba?%([%d%.,%%/]+%)$') or v:match('^hsla?%([%d%.,%%/deg]+%)$') or v:match('^%a+$') then
        return value
    end
    return nil
end

-- ox_lib's `style`: flat CSS properties only, no values that can pull in outside content.
local function style(value)
    if type(value) ~= 'table' then return nil end
    local out, count = {}, 0
    for k, v in pairs(value) do
        if type(k) == 'string' and k:match('^%a+$') and #k <= 32 then
            local tv = type(v)
            if tv == 'number' then
                out[k] = v
            elseif tv == 'string' and #v <= 64 then
                local lower = v:lower()
                if not (lower:find('url', 1, true) or lower:find('image', 1, true) or lower:find('expression', 1, true)
                    or lower:find('import', 1, true) or lower:find('\\', 1, true)) then
                    out[k] = v
                end
            end
            count = count + 1
            if count >= 16 then break end
        end
    end
    return next(out) and out or nil
end

local function icon(value)
    if type(value) == 'string' then return #value <= 48 and value or nil end
    if type(value) == 'table' and type(value[1]) == 'string' and type(value[2]) == 'string' and #value[1] <= 16 and #value[2] <= 48 then
        return { value[1], value[2] }
    end
    return nil
end

local function sound(value)
    if type(value) ~= 'table' or type(value.name) ~= 'string' or type(value.set) ~= 'string' then return nil end
    if #value.name > 64 or #value.set > 64 then return nil end
    local bank = type(value.bank) == 'string' and #value.bank <= 64 and value.bank or nil
    return { name = value.name, set = value.set, bank = bank }
end

local function id(value)
    if type(value) == 'number' then return value end
    return str(value, 64)
end

-- ---------------------------------------------------------------------------
-- NUI link
-- ---------------------------------------------------------------------------
local ready = false
local queue = {}

local function decode(raw)
    if type(raw) ~= 'string' or raw == '' or #raw > MAX_PREFS_BYTES then return nil end
    local ok, data = pcall(json.decode, raw)
    return ok and type(data) == 'table' and data or nil
end

-- Local copy so settings show instantly on join; the database copy (if used) replaces it.
local prefs = decode(GetResourceKvpString(KVP_KEY))

local function serverConfig()
    return {
        styles = Config.Styles,
        duration = Config.Duration,
        maxVisible = Config.MaxVisible,
        offset = Config.Offset,
        playerSettings = Config.PlayerSettings,
        historySize = Config.HistorySize,
        defaults = Config.Defaults,
    }
end

local function send(message)
    if ready then return SendNUIMessage(message) end
    -- The page can still be loading on join; hold a few so early notifications aren't lost.
    if #queue < 25 then queue[#queue + 1] = message end
end

local function markReady()
    ready = true
    for i = 1, #queue do SendNUIMessage(queue[i]) end
    queue = {}
end

RegisterNUICallback('ready', function(_, cb)
    cb({ config = serverConfig(), prefs = prefs })
    if not ready then markReady() end
end)

-- Safety net if the handshake never arrives.
SetTimeout(10000, function()
    if ready then return end
    SendNUIMessage({ action = 'config', data = serverConfig() })
    if prefs then SendNUIMessage({ action = 'prefs', data = prefs }) end
    markReady()
end)

-- ---------------------------------------------------------------------------
-- Player settings storage
-- ---------------------------------------------------------------------------
if Config.Storage == 'database' then
    RegisterNetEvent('bakery_notif:prefs', function(raw)
        local data = decode(raw)
        if not data then return end
        prefs = data
        SetResourceKvp(KVP_KEY, raw)
        send({ action = 'prefs', data = prefs })
    end)

    CreateThread(function()
        while not NetworkIsSessionStarted() do Wait(250) end
        TriggerServerEvent('bakery_notif:requestPrefs')
    end)
end

RegisterNUICallback('savePrefs', function(data, cb)
    cb('ok')
    if type(data) ~= 'table' then return end
    local raw = json.encode(data)
    if #raw > MAX_PREFS_BYTES then return end
    prefs = data
    SetResourceKvp(KVP_KEY, raw)
    if Config.Storage == 'database' then TriggerServerEvent('bakery_notif:savePrefs', raw) end
end)

-- ---------------------------------------------------------------------------
-- Settings menu
-- ---------------------------------------------------------------------------
local settingsOpen = false

local function openSettings()
    if not Config.PlayerSettings or settingsOpen then return end
    settingsOpen = true
    SetNuiFocus(true, true)
    send({ action = 'openSettings' })
end

local function closeSettings()
    if not settingsOpen then return end
    settingsOpen = false
    SetNuiFocus(false, false)
    send({ action = 'closeSettings' })
end

RegisterNUICallback('close', function(_, cb)
    cb('ok')
    settingsOpen = false
    SetNuiFocus(false, false)
end)

if Config.PlayerSettings then
    RegisterCommand(Config.SettingsCommand, openSettings, false)
    RegisterKeyMapping(Config.SettingsCommand, 'Open notification settings', 'keyboard', Config.SettingsKey or '')
end

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

-- ox_lib's `sound` field. The UI only asks for it when the toast showed and the player hasn't muted.
RegisterNUICallback('playGtaSound', function(data, cb)
    cb('ok')
    local s = sound(data)
    if not s then return end
    CreateThread(function()
        if s.bank then
            local timeout = GetGameTimer() + 3000
            while not RequestScriptAudioBank(s.bank, false) do
                if GetGameTimer() > timeout then return end
                Wait(0)
            end
        end
        local soundId = GetSoundId()
        PlaySoundFrontend(soundId, s.name, s.set, true)
        ReleaseSoundId(soundId)
        if s.bank then ReleaseNamedScriptAudioBank(s.bank) end
    end)
end)

---@alias NotificationPosition 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'center-right' | 'center-left'
---@alias NotificationType 'info' | 'warning' | 'success' | 'error'
---@alias IconAnimationType 'spin' | 'spinPulse' | 'spinReverse' | 'pulse' | 'beat' | 'fade' | 'beatFade' | 'bounce' | 'shake'

---Field for field the same as ox_lib's NotifyProps, so `lib.notify(data)` hands over untouched.
---@class NotifyProps
---@field id? string | number
---@field title? string
---@field description? string
---@field duration? number
---@field showDuration? boolean
---@field position? NotificationPosition
---@field type? NotificationType
---@field style? { [string]: any }
---@field icon? string | { [1]: string, [2]: string }
---@field iconAnimation? IconAnimationType
---@field iconColor? string
---@field alignIcon? 'top' | 'center'
---@field sound? { bank?: string, set: string, name: string }
---@field persistent? boolean bakery_notif extra: stays until hide(id)

---Same call as ox_lib's `lib.notify(data)`. Also takes the short form (description, type, duration, title).
---@param data NotifyProps | string
function BakeryNotify(data, notifyType, duration, title)
    if type(data) ~= 'table' then
        data = { description = data, type = notifyType, duration = duration, title = title }
    end

    local payload = {
        id = id(data.id),
        title = str(data.title, 120),
        description = str(data.description, 600),
        duration = tonumber(data.duration) and math.min(600000, math.max(500, tonumber(data.duration))) or nil,
        showDuration = type(data.showDuration) == 'boolean' and data.showDuration or nil,
        position = POSITIONS[data.position],
        type = str(data.type, 16),
        style = style(data.style),
        icon = icon(data.icon),
        iconAnimation = ICON_ANIMATIONS[data.iconAnimation] and data.iconAnimation or nil,
        iconColor = color(data.iconColor),
        alignIcon = (data.alignIcon == 'top' or data.alignIcon == 'center') and data.alignIcon or nil,
        sound = sound(data.sound),
        persistent = data.persistent == true or nil,
    }
    if not payload.title and not payload.description then return end

    send({ action = 'notify', data = payload })
end

---Same call as ox_lib's `lib.defaultNotify(data)` (v3 style: `status` instead of `type`).
function BakeryDefaultNotify(data)
    if type(data) ~= 'table' then return end
    local status = data.status == 'inform' and 'info' or data.status
    return BakeryNotify({
        id = data.id,
        title = data.title,
        description = data.description,
        duration = data.duration,
        position = data.position,
        type = status,
    })
end

function BakeryNotifyHide(notifyId)
    notifyId = id(notifyId)
    if notifyId == nil then return end
    send({ action = 'hide', data = notifyId })
end

function BakeryNotifyClear()
    send({ action = 'clear' })
end

-- Client exports. Names match ox_lib's (notify / defaultNotify), so the ox_lib snippet is a straight hand-off.
exports('notify', BakeryNotify)
exports('defaultNotify', BakeryDefaultNotify)
exports('hide', BakeryNotifyHide)
exports('clear', BakeryNotifyClear)
exports('openSettings', openSettings)
exports('closeSettings', closeSettings)

-- Fired by the server exports (server/main.lua). Clients can't trigger these on each other.
RegisterNetEvent('bakery_notif:notify', BakeryNotify)
RegisterNetEvent('bakery_notif:defaultNotify', BakeryDefaultNotify)
RegisterNetEvent('bakery_notif:hide', BakeryNotifyHide)
RegisterNetEvent('bakery_notif:clear', BakeryNotifyClear)
RegisterNetEvent('bakery_notif:openSettings', openSettings)
RegisterNetEvent('bakery_notif:closeSettings', closeSettings)

-- ---------------------------------------------------------------------------
-- /notiftest: four samples, then one test through each framework you run.
-- Bakery style = that snippet is in. Framework's own style = it isn't.
-- ---------------------------------------------------------------------------
if Config.TestCommand then
    RegisterCommand('notiftest', function()
        local samples = {
            { type = 'success', title = 'Vehicle Stored', description = 'Your **Elegy RH8** was parked at Pillbox Garage.' },
            { type = 'error', title = 'Insufficient Funds', description = 'You need **$2,500** to buy this.' },
            { type = 'warning', title = 'Fuel Low', description = 'Tank is at 12%. Find a gas station.', icon = 'gas-pump' },
            { type = 'info', title = 'Race Invite', description = 'Mia invited you to **Vinewood Sprint**.', icon = 'flag-checkered' },
        }
        for i = 1, #samples do
            samples[i].duration = 6000
            BakeryNotify(samples[i])
            Wait(180)
        end

        Wait(400)
        if GetResourceState('ox_lib') == 'started' then
            TriggerEvent('ox_lib:notify', { type = 'info', title = 'ox_lib snippet', description = 'Sent with ox_lib:notify', duration = 6000 })
            Wait(180)
        end
        if GetResourceState('es_extended') == 'started' then
            TriggerEvent('esx:showNotification', 'Sent with ~g~ESX.ShowNotification~s~', 'success', 6000, 'ESX snippet')
            Wait(180)
        end
        if GetResourceState('qb-core') == 'started' or GetResourceState('qbx_core') == 'started' then
            TriggerEvent('QBCore:Notify', 'Sent with QBCore:Notify', 'success', 6000)
        end
    end, false)
end
