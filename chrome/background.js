
chrome.contextMenus.create({
    title: "play",
    type: "normal",
    contexts: ['video','link'],
    onclick:function (ev) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:4242/play", true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify({
            url:ev.linkUrl,
            src:ev.srcUrl,
        }));
    },
});
