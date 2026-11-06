fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'bakery_notify'
author 'Bakery'
description 'Notifications for ox_lib, Qbox, ESX and QBCore with six styles and per-player settings'
version '1.0.0'

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*',
}

shared_script 'config.lua'

client_scripts {
    'client/main.lua',
    'client/frameworks.lua',
}

server_script 'server/main.lua'
