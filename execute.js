#!exec "$(command -v node || command -v nodejs)" "$0" "$@"

var uuid = require('node-uuid')
var spawn = require('pty.js').spawn
var messaging = require('chrome-native-messaging')

var native = {}
native.input = new messaging.Input()
native.transform = new messaging.Transform(onMessage)
native.output = new messaging.Output()

process.stdin
    .pipe(native.input)
    .pipe(native.transform)
    .pipe(native.output)
    .pipe(process.stdout)

var children = {}

function onMessage(message, push, done) {
    console.error('received:', message)
    if (message.input) {
        var id = message.id
        var term = children[id]
        if (term) {
            term.write(message.input)
        } else {
            push({id:id,found:false})
        }
    } else if (message.spawn && Array.isArray(message.args)) {
        var id = uuid.v4()
        console.error('spawn:', message.spawn, (message.args).join(' '))
        var term = spawn(message.spawn, message.args, message.opts)
        term.on('error', function (err) {
            console.error("command '%s' errored:", message.spawn, err)
            if (term._emittedClose) return
            native.output.write({id:id,error:err.stack || err.message || err})
        })
        term.on('data', function (data) {
            if (term._emittedClose) return
            native.output.write({id:id,data:data.toString('utf-8')})
        })
        term.on('close', function () {
            console.error("command '%s' closed.", message.spawn)
            native.output.write({id:id,closed:true})
        })
        children[id] = term
        push({id:id,executed:true})
    } else {
        push({ignored:true})
    }
    done()
}


