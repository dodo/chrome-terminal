
function commandTitle(command) {
    return command && (command.name || command.cmd || command.cwd) || "---"
}

function createContextMenuItem(command) {
    command.id = chrome.contextMenus.create({
        title: commandTitle(command),
        type: "normal",
        contexts: ['all'], // ['video','link'], // FIXME TODO
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

function clickedContextMenuItem(ev) { // command could have changed by now
    var commands = JSON.parse(localStorage['commands'] || '[]')
    for (var i = 0, len = commands.length; i < len ; i++) {
        var command = commands[i]
        if (command.id == ev.menuItemId) {
            executeCommand(command, ev)
            break
        }
    }
}

function executeCommand(command, ev) {
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
            return ev[key] || ""
        }).trim()
    })
    message.spawn = message.args.shift()
    if (command.cwd) message.opts = {cwd:command.cwd}

    if (!message.spawn) return
    console.log('post message', message)
    port.postMessage(message)
    return message
}

