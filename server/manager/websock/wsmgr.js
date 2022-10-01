const webSockServer = require('ws').Server
const { Keypair, KeyHelper } = require('../../../common/util/keyhelper/keyhelper')
const { MSGHelper } = require('../../../common/msg/msg')
const { Logger } = require('../../../common/log')

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
    
    fin() {
        this.webSockServerListener.clients.forEach(function each(client) {
            if (client !== ws ) {
              client.close()
            }
        });

        this.webSockServerListener = null      
        this.bStart = false
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
            // create key

            var serverKey = new Keypair()
            var clientPubkey = '';

            webSocket.on('message', function (byteBuffer) {
                var jsonMessage = JSON.parse(byteBuffer)
                var response = '';

                switch( jsonMessage['cmd'] ) {
                    case "KEYEX":
                        clientPubkey = jsonMessage["body"]
                        response = MSGHelper.buildResponse("KEYEX", true, serverKey.getPublicKeyBase64())
                        webSocket.send(response)
                        Logger.dbg('serverKey:', serverKey.getPublicKeyBase64())
                        Logger.dbg('clientKey:', clientPubkey)
                        break

                    case "CONN":
                        console.log("CONN", jsonMessage)
                        var options = JSON.parse(serverKey.decryptString(jsonMessage['body']))
                        console.log(options)
                        //Logger.dbg(options)
                        response = MSGHelper.buildResponse('CONN', true)
                        webSocket.send(response)
                        //sshconn.connect(rawJson['body'])
                        //ws.send(_retv(true, "success"))
                        break

                    case "SHELL":
                        console.log("SHELL", jsonMessage)                        
                        break
                    default:
                        console.log("ERROR", jsonMessage)
                }       

                webSocket.send(response)
            })

            webSocket.on('close', () => {
                Logger.dbg(clientPubkey, "is closed")
            })
        })
    }
}

module.exports = { WSServerManager }