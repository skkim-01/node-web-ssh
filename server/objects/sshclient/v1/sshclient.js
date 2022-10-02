const { Client }    = require('ssh2');
const { EventEmitter } = require('events')
const { conv } = require('../../../common/util/conv')

class SSHClient {
    // TODO: is it need?
    eventEmitter = new EventEmitter()
    sshClient = new Client()

    _handleOutputMessage(message) {
        return message
    }

    async connect(jsonOptions) {
        // var client = new Client()
        // this.sshClient = client
        this.sshClient.connect(jsonOptions)

        return new Promise( (resolve, reject) => {            
            this.sshClient.on('ready', () => {                
                resolve(true)
            })
    
            this.sshClient.on('error', (msg) => {
                console.log("\tEV/ERROR", msg)
                resolve(false)
            })

            this.sshClient.on('close', () => {
                console.log("\tEV/END")
                this.eventEmitter.emit('message', 'EV/Close')
            })
    
            this.sshClient.on('end', (msg) => {
                console.log("\tEV/END", msg)
                this.eventEmitter.emit('message', 'EV/end')
            })
        })
    }

    async disconnect() {
        this.sshClient.end()

        return new Promise( (resolve, reject) => {
            this.eventEmitter.once('message', (message) => {
                resolve( this._handleOutputMessage(message) )
            })
        })
    }

    async exec(cmd) {        
        var msg = ''        
        return new Promise( (resolve, reject) => {
            this.sshClient.exec( cmd, function(err, stream) {
                if (err) throw err;

                stream.on('close', function(code, signal) {                    
                    resolve(conv.buf2utf8(msg))
                }).on('data', function(data) {                    
                    msg = data
                }).stderr.on('data', function(data) {                    
                    msg = data
                });
            })
        })
    }
}

module.exports = { SSHClient }