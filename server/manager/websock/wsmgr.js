const webSockServer = require('ws').Server
const { Keypair, KeyHelper } = require('../../../common/util/keyhelper/keyhelper')
const { MSGHelper } = require('../../../common/msg/msg')
const { Logger } = require('../../../common/log')
const { SSHClient } = require('../../objects/sshclient/v1/sshclient')

class WSServerManager {
    static _Instance = null;

    static getInstance() {
        if (WSServerManager._Instance == null) {
            WSServerManager._Instance = new WSServerManager();
        }
        return this._Instance;
    }

    bStart = false
    webSockServerListener = null
    
    async fin() {
        return new Promise( (resolve, reject) => {
            this.webSockServerListener.clients.forEach(function each(client) {
                client.close()
            })
            this.bStart = false
            this.webSockServerListener.close()
            resolve()
        })
        
    }

    async start( port = 9998 ) {
        if ( this.bStart ) {
            console.log('WebSockServerMgr is already running')
            return 
        }

        this.webSockServerListener = new webSockServer({ port: port })
        this.bStart = true

        // listen-accept client
        this.webSockServerListener.on('connection', function(webSocket) {
            
            var serverKey = new Keypair()
            var clientPubkey = '';
            var sshClient = new SSHClient()

            webSocket.on('message', async function (byteBuffer) {                
                var jsonMessage = JSON.parse(byteBuffer)
                var response = '';

                switch( jsonMessage['cmd'] ) {
                    case "KEYEX":
                        clientPubkey = jsonMessage["body"]
                        response = MSGHelper.buildResponse("KEYEX", true, serverKey.getPublicKeyBase64())
                        webSocket.send(response)
                        Logger.dbg('KEYEX')
                        Logger.dbg('serverKey:', serverKey.getPublicKeyBase64())
                        Logger.dbg('clientKey:', clientPubkey)
                        break

                    case "CONN":
                        Logger.dbg('CONN')
                        var options = JSON.parse(serverKey.decryptString(jsonMessage['body']))
                        console.log(options)                        
                        var connectResult = await sshClient.connect(options)
                        console.log(connectResult)
                        response = MSGHelper.buildResponse('CONN', connectResult)
                        webSocket.send(response)                        
                        break

                    case "SHELL":
                        Logger.dbg('SHELL')
                        console.log('#jsonMessage#', jsonMessage)                        
                        var command = serverKey.decryptString(jsonMessage['body'])
                        console.log('#command#', command)
                        var consoleResult = await sshClient.exec(command)
                        console.log('#consoleResult#', consoleResult)
                        webSocket.send(
                            MSGHelper.buildSecureResponse('SHELL', true, consoleResult, clientPubkey)
                        )                        
                        break

                    default:
                        console.log("ERROR", jsonMessage)
                        webSocket.send(
                            MSGHelper.buildResponse('ERROR', false, 'invalid command')
                        )
                        break
                }
            })

            webSocket.on('close', () => {
                Logger.dbg(clientPubkey, "is closed")
            })
        })
    }
}

module.exports = { WSServerManager }