const { Client }    = require('ssh2');
const { EventEmitter } = require('events')
const { conv } = require('../../common/util/conv')

class SSHClient {
    // TODO: is it need?
    eventEmitter = new EventEmitter()
    sshClient = new Client()

    outStream

    _handleOutputMessage(message) {
        return message
    }
    oneshotexe(cmd) {
        console.log('oneshotexe')
        this.eventEmitter.emit('execute', 'ls -al')
    }

    oneshot(jsonOptions) {
        var conn = new Client()
        conn.on('ready', () => {
            console.log('Client :: ready');
            conn.shell((err, stream) => {
                if (err) throw err;
    
                stream.on('close', () => {
                        console.log('Stream :: close');                        
                    }).on('data', (data) => {
                        //console.log( conv.buf2utf8(data) );
                        console.log( data );
                        
                    });

                    this.eventEmitter.on('execute', (msg) => {
                        console.log('emitted')
                        console.log(msg)
                        stream.end()
                    })
                    
                    //stream.push('ls -al', "utf-8")
                    //stream.end('ls -l');
                });
            }).connect(jsonOptions);
    }

    async shellMsg() {
        return new Promise( (resolve, reject) => {
            var out = ''
            this.sshClient.shell((err, stream) => {
                if ( err ) resolve(err)
                stream.on('close', () => {
                    console.log('stream close')  
                }).on('data', (data) => {                    
                    console.log( conv.buf2utf8(data).trim() + '\n' )
                    //console.log( data.length )
                    //console.log(stream.readableLength)
                }).on('end', () => {
                    resolve('end')
                })
                stream.end();
            });
        })
    }

    async connect(jsonOptions) {
        this.sshClient.connect(jsonOptions)

        return new Promise( (resolve, reject) => {            
            this.sshClient.on('ready', () => {
                //resolve(this.shellMsg())
                resolve('test')
            })

            this.sshClient.on('banner', (msg) => {
                console.log(msg)
            })

            this.sshClient.on('greeting', (msg) => {
                console.log(msg)
            })
    
            this.sshClient.on('error', (msg) => {
                console.log("\tEV/ERROR", msg)
                resolve('ERROR')
            })

            this.sshClient.on('close', () => {                
                this.eventEmitter.emit('message', 'EV/Close')
            })
    
            this.sshClient.on('end', (msg) => {                
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
                    console.log('stdout:')
                    msg = data
                }).stderr.on('data', function(data) {
                    console.log('stderr')
                    msg = data
                });
            })
        })
    }
}

module.exports = { SSHClient }