
function commandTitle(command) {
    return command && (command.name || command.cmd || command.cwd) || "---"
}

function createContextMenuItem(command) {
    command.id = chrome.contextMenus.create({
        title: commandTitle(command),
        type: "normal",
        contexts: ['all'], // ['video','link'], // FIXME TODO
//         contexts: ['video','link'], // FIXME TODO
        onclick: clickedContextMenuItem,
    }, function () {
        var err = chrome.runtime.lastError
        if (err) console.error("failed to create context menu item: %s",err.message||err, command)
        else console.log("context menu item created.", command)
    })
    return command
}

function updateContextMenuItem(command) {
    if (!command.id) return
    chrome.contextMenus.update(command.id ,{title:commandTitle(command)}, function () {
        var err = chrome.runtime.lastError
        if (err) console.error("failed to update context menu item: %s",err.message||err, command)
        else console.log("context menu item updated.", command)
    })
}

function removeContextMenuItem(command) {
    if (!command.id) return
    chrome.contextMenus.remove(command.id, function () {
        var err = chrome.runtime.lastError
        if (err) console.error("failed to remove context menu item: %s",err.message||err, command)
        else console.log("context menu item removed.", command)
    })
}

function clickedContextMenuItem(ev, tab) { // command could have changed by now
    var commands = JSON.parse(localStorage['commands'] || '[]')
    for (var i = 0, len = commands.length; i < len ; i++) {
        var command = commands[i]
        if (command.id == ev.menuItemId) {
            var exe = executeCommand(tab, command, ev)
            if (exe && typeof onExecution === 'function')
                onExecution(exe)
            break
        }
    }
}

function executeCommand(tab, command, ev) {
    console.log('execute', command)

    var port = chrome.runtime.connectNative('localhost.command.execute')

    port.onMessage.addListener(function (message) {
        if (message.error) {
            console.error(message.error)
        } else if (message.closed) {
            port.disconnect()
        }
    })

    var message = {}
    message.args = command.cmd.split(' ')
    .filter(function (s) {return !!s})
    .map(function (arg) {
        return arg.replace(/\%(\w+)/g, function (m,key) {
            var val = ev[key] || ""
            if (command.creds && command.creds.user) {
                var part = command.creds.user
                if (command.creds.password) part += ':' + command.creds.password
                val = val.replace(/^([^/]+):\/\//, '$1://'+part+'@')
            }
            return val
        }).trim()
    })
    message.spawn = message.args.shift()
    if (command.cwd) message.opts = {cwd:command.cwd,name:'xterm'}

    if (!message.spawn) return
    console.log('post message', message)
    port.postMessage(message)
    message.port = port
    message.tab = tab
    return message
}

