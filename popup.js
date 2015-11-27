var id = window.location.hash.substring(1);

document.addEventListener('DOMContentLoaded', function () {
    terminal = new Terminal({
        geometry: [80,20],
        useStyle: true,
    })

    terminal.on('title', function(title) {
        document.title = title
    })

    var command = "";
    terminal.on('data', function (data) {
        if (!running) return
        port.postMessage({type:'input', data:data})
    })

    terminal.open(document.getElementById('terminal'))

    var port = chrome.runtime.connect()
    port.onMessage.addListener(function (data) {
        terminal.write(data)
    })
    port.postMessage({type:'tab', id:id})
    running = true
})
