
var template = document.getElementById('command-template')

document.addEventListener('DOMContentLoaded', function () {
    var commands = JSON.parse(localStorage['commands'] || '[]')
    commands.forEach(addCommand)
})

document.getElementById('add-button').addEventListener('click', function (ev) {
    addCommand(store(createContextMenuItem({name:"", cwd:"", cmd:""})))
})

document.body.addEventListener('click', function (ev) {
    if ( ev.target.nodeName.toLowerCase() !== 'button') return
    if (!ev.target.hasAttribute('data-id')) return
    var command, commands = JSON.parse(localStorage['commands'] || '[]')
    var id = parseInt(ev.target.getAttribute('data-id'))
    var command = commands[id]
    if (!command) return
    ev.target.parentNode.remove()
    removeContextMenuItem(command)
    for (var i = commands.length-1 ; i > id ; i-- ) {
        var el = document.getElementById('command-'+i)
        el.querySelector('button[data-id]').setAttribute('data-id', i-1)
        el.setAttribute('id', 'command-'+(i-1))
        commands[i-1] = commands[i]
    }
    commands.pop()
    localStorage['commands'] = JSON.stringify(commands)
})

function addCommand(command, i) {
    if (typeof i !== 'number') {
        var commands = JSON.parse(localStorage['commands'] || '[]')
        i = commands.length - 1
    }
    var element = template.content.cloneNode(/*deep=*/true)
    var container = element.querySelector('div')
    container.setAttribute('id', 'command-'+i)
    element.querySelector('button').setAttribute('data-id', i)
    ;['name','cmd','cwd']
    .forEach(function (key) {
        var el = container.querySelector('input[name="'+key+'"]')
        el.setAttribute('value', command[key])
        el.addEventListener('input', function (ev) {
            var id = container.getAttribute('id').replace(/^command-/, '')
            command[key] = ev.target.value
            store(command, id)
            if (key === 'name') updateContextMenuItem(command)
        })
    })
    document.body.appendChild(element)
}

function store(command, i) {
    var commands = JSON.parse(localStorage['commands'] || '[]')
    if (i === null || typeof i === 'undefined') {
        commands.push(command)
    } else {
        commands[i] = command
    }
    localStorage['commands'] = JSON.stringify(commands)
    return command
}
