var util = require('util');
var http = require('http');
var spawn = require('child_process').spawn;
var express = require('express');

var parser = {
    json: require('body-parser').json(),
};


exports.app = express();
exports.http = http.Server(exports.app);



exports.app.post('/play', parser.json, function (req, res) {
    if (!req.body['url'] && !req.body['src'])
        return res.status(400).json({error:'missing url!'});

    if (req.body['url']) console.log('url', req.body['url']);
    if (req.body['src']) console.log('src', req.body['src']);

    var params = {opts:{stdio:'inherit'}};
    if (req.body['url']) {
        params.cmd = './youtube-mplayer';
        params.args = [req.body['url']];
        params.opts.cwd = '/home/dodo/.zsh/scripts';
    } else if (req.body['src']) {
        params.cmd = 'mpv';
        params.args = [req.body['src']];
    }

    var player = spawn(params.cmd, params.args, params.opts);
    player.on('error', function (err) {console.log('video player errored:', err)});
    player.on('close', function () {console.log('video player closed.')});

    res.json({url:'ok'});
});

// starting the http server
exports.http.port = 4242;
exports.http.hostname = 'localhost';
exports.http.listen(exports.http.port, exports.http.hostname, function () {
    console.log("listening on %s:%s …", exports.http.hostname, exports.http.port);
});
