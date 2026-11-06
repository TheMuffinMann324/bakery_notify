Config = {}

-- ---------------------------------------------------------------------------
-- Player settings (/notifsettings)
-- ---------------------------------------------------------------------------
Config.PlayerSettings = true          -- false: players can't open the settings, everyone gets Config.Defaults
Config.SettingsCommand = 'notifsettings'
Config.SettingsKey = ''               -- default key, e.g. 'F7'. Empty = unbound; players set it in Settings > Key Bindings > FiveM

-- 'database' saves to MySQL through oxmysql, so settings follow the player to any PC (needs oxmysql).
-- 'kvp' saves on the player's PC only. Either way a local copy is kept so settings load instantly.
Config.Storage = 'database'

-- Styles players can pick from. Remove one to hide it from the menu.
--   racing    : the bakery_racing toast. Icon strip, heavy uppercase, success flips to white
--   billboard : slanted type tab, black-italic title, coloured edge glow
--   phone     : GTA6 phone push. Frosted glass, app tile, "now" stamp
--   pill      : compact one-liner, countdown ring around the icon
--   news      : broadcast lower third. Slanted type block, wide bar, ticker countdown
--   mission   : open-world mission card. Fading band, centred black-italic title
Config.Styles = { 'racing', 'billboard', 'phone', 'pill', 'news', 'mission' }

Config.HistorySize = 50               -- notifications kept in the History tab (this session only)

-- What a new player starts with (and what "Reset to defaults" goes back to).
Config.Defaults = {
    style = 'racing',
    position = 'top-right',           -- top | top-right | top-left | bottom | bottom-right | bottom-left | center-right | center-left
    forcePosition = false,            -- true: also move notifications that ask for their own position
    scale = 1.0,                      -- 0.7 - 1.4
    opacity = 1.0,                    -- 0.4 - 1.0
    durationMul = 1.0,                -- 0.5 - 2.5, multiplies every notification's time on screen
    showDuration = true,              -- countdown bar / ring
    reducedMotion = false,
    mute = false,
    volume = 0.4,                     -- 0.0 - 1.0
    -- none | blip | pop | chime | soft | alert | buzz | bell
    sounds = { info = 'blip', success = 'chime', warning = 'alert', error = 'buzz' },
    dnd = false,
    dndAllowErrors = true,
    customX = 70,                     -- the drag-to-place spot, in % of the screen
    customY = 12,
}

-- ---------------------------------------------------------------------------
-- Behaviour
-- ---------------------------------------------------------------------------
Config.Duration = 3000       -- ms, used when a notification has no duration (ox_lib's default is 3000)
Config.MaxVisible = 5        -- per position; the oldest is pushed out past this
Config.Offset = 24           -- px from the screen edge

-- /notiftest previews every type and checks each framework patch. Turn off on live servers.
Config.TestCommand = true
