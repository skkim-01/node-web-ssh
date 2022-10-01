const { w3cwebsocket } = require('websocket')
const { EventEmitter } = require('events')

class WSClient {
    clientSocket = null
    isConnected = false
    eventEmitter = new EventEmitter()    

    _onReceivecallback( messageEvent ) {
        return messageEvent.data
    }
    
    async connect( url, force = false ) {
        if ( force ) {
            this.close()
        } else {
            if( this.isConnected ) {
                return
            }
        }

        this.clientSocket = new w3cwebsocket( url )
        return new Promise( (resolve, reject) => { 
            this.clientSocket.onopen = () => {
                this.isConnected = true
                console.log('#INFO\tWSClient.Connect().onopen:\tWebSocket Client Connected')
                resolve()
            };
            this.clientSocket.onmessage = (messageEvent) => {
                console.log('#INFO\tWSClient.Connect().onmessage:\tWebSocket Client Connected')
                this.eventEmitter.emit('message', messageEvent)
            };
            this.clientSocket.onerror = () => {
                console.log('#INFO\tWSClient.Connect().onerror:\tWebSocket Client Connected')
                // TODO:
            };
            this.clientSocket.onclose = () => {
                console.log('#INFO\tWSClient.Connect().onclose:\tWebSocket Client Connected')
                // TODO:
            }
        })
    }

    // send message
    async send(message) {
        this.clientSocket.send(message)

        return new Promise ( (resolve, reject) => {
            this.eventEmitter.once('message', (messageEvent) => {
                resolve( this._onReceivecallback(messageEvent) )
            })
            
        })
    }

    close() {
        if ( this.clientSocket != null ) {
            this.clientSocket.close()
        }
        this.clientSocket = null
    }
}

module.exports = { WSClient }