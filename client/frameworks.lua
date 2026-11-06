--[[
    Hand-offs for the framework snippets in the README.

    ox_lib / Qbox need nothing here: the ox_lib snippet calls exports.bakery_notify:notify(data)
    with ox_lib's own table, and Qbox's notify goes through lib.notify.
]]

-- ESX: same arguments as ESX.ShowNotification(message, type, length, title, position).
-- That function also handles esx:showNotification and xPlayer.showNotification.
exports('esxNotify', function(message, notifyType, length, title, position)
    return BakeryNotify({
        type = notifyType,
        duration = length,
        description = message,
        title = title,
        position = position,
    })
end)

-- QBCore: same arguments as QBCore.Functions.Notify(text, texttype, length, icon).
-- That function also handles the QBCore:Notify event.
local QB_TYPES = {
    primary = { type = 'info' },
    police = { type = 'info', icon = 'shield-halved', iconColor = '#60a5fa' },
    ambulance = { type = 'info', icon = 'truck-medical', iconColor = '#f87171' },
}

exports('qbNotify', function(text, texttype, length, icon)
    local data = { duration = length }

    -- qb accepts a string or { text = 'message', caption = 'title' }
    if type(text) == 'table' then
        data.description = text.text
        data.title = text.caption
    else
        data.description = text
    end

    local mapped = QB_TYPES[texttype]
    data.type = mapped and mapped.type or texttype
    data.icon = icon or (mapped and mapped.icon)
    data.iconColor = mapped and mapped.iconColor

    return BakeryNotify(data)
end)
