
// create/update context menu item ids
localStorage['commands'] = JSON.stringify(
    JSON.parse(localStorage['commands'] || '[]').map(createContextMenuItem)
)

