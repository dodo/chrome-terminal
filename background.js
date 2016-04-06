
// create/update context menu item ids
localStorage['commands'] = JSON.stringify(
    JSON.parse(localStorage['commands'] || '[]').map(createContextMenuItem)
)

var ports = {}
var executions = {}

chrome.runtime.onConnect.addListener(function (port) {
    var tabid = undefined
    var connected = true
    port.onMessage.addListener(function (message) {
        if (message.type === 'tab') {
            tabid = message.id
            ports[tabid] = port
            var exe = executions[tabid]
            if (exe) exe.playback.forEach(function (data) {
                if (connected) port.postMessage(data)
            })
        } else if (message.type === 'input') {
            var exe = executions[tabid]
            if (exe && exe.connected)
                exe.port.postMessage({input:message.data, id:exe.id})
        }
    })
    port.onDisconnect.addListener(function () {
        if (ports[tabid]) delete ports[tabid]
        connected = false
    })
})


function onExecution(exe) {
    exe.playback = [[exe.spawn].concat(exe.args).join(' ')+'\n\r']
    executions[exe.tab.id] = exe
    chrome.pageAction.setPopup({
        popup: 'popup.html#' + exe.tab.id,
        tabId: exe.tab.id,
    })
    chrome.pageAction.show(exe.tab.id)
    exe.port.onMessage.addListener(function (message) {
        exe.id = message.id
        if (message.data) {
            exe.playback.push(message.data)
            if (exe.playback.length > 1000)
                exe.playback.shift()
            if (ports[exe.tab.id])
                ports[exe.tab.id].postMessage(message.data)
        } else if (message.closed) {
            delete executions[exe.tab.id]
            chrome.pageAction.hide(exe.tab.id)
        }
    })
}
