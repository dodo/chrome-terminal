terminal = null
running = false
port = null
command_id = null


document.addEventListener('DOMContentLoaded', function () {
    terminal = new Terminal({
        geometry: [160,42],
        useStyle: true,
    })

    terminal.on('title', function(title) {
        document.title = title
    })

    var command = "";
    terminal.on('data', function (data) {
        if (!running) return
        port.postMessage({input:data, id:command_id})
    })

    terminal.open(document.getElementById('terminal'))
})

document.getElementById('execute-button').addEventListener('click', function (ev) {
    ev.target.disabled = true
    var cmd = document.getElementById('input-cmd').value.trim()
    var cwd = document.getElementById('input-cwd').value.trim()
    execute(cmd, cwd, function () {
        ev.target.disabled = false
    })
})



function execute(cmd, cwd, callback) {
    var message = {args:[]}
    if (cwd) message.opts = {cwd:cwd}
    terminal.eraseInDisplay([3]) // clear everything

    message.args = cmd.split(' ').filter(function (s) {return !!s})
    message.spawn = message.args.shift()

    if (!message.spawn) return;

    port = chrome.runtime.connectNative('localhost.command.execute')

    port.onMessage.addListener(function (message) {
        command_id = message.id
        if (message.data) {
            terminal.write(message.data)
        } else if (message.error) {
            console.error(message.error)
            terminal.write(message.error)
        } else if (message.closed) {
            running = false
            if (callback) callback()
            port.disconnect()
            port = null
        } else if (message.executed) {
            running = true
        }
    })

    port.onDisconnect.addListener(function () {
        running = false
        if (callback) callback()
        port = null
    })

    console.log("send:", message)
    port.postMessage(message)
}

