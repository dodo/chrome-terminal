
chrome.contextMenus.create({
    title: "play",
    type: "normal",
    contexts: ['video','link'],
    onclick:function (ev) {

        var port = chrome.runtime.connectNative('localhost.command.execute')

        port.onMessage.addListener(function (message) {
            if (message.error) {
                console.error(message.error)
            } else if (message.closed) {
                port.disconnect()
            }
        })

        port.postMessage({
            spawn: "./youtube-mplayer",
            args: [ev.linkUrl],
            opts: {cwd:"/home/dodo/.zsh/scripts"},
        })

    },
});
