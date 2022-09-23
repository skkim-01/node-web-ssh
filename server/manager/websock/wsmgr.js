const webSockServer = require('ws').Server

class WebSockServerMgr {
    static _Instance = null;

    static getInstance() {
        if (WebSockServerMgr._Instance == null) {
            WebSockServerMgr._Instance = new WebSockServerMgr();
        }
        return this._Instance;
    }

    bInit = false
    webSockServerListener = null

    init() {
        if( this.bInit ) {
            return
        } else {
            // TODO: Config
            this.webSockServerListener = new WebSockServerMgr(
                { port: 9998 })
            this.bInit = true
        }

        this.start()
    }

    fin() {
        this.webSockServerListener.clients.forEach(function each(client) {
            if (client !== ws ) {
              client.terminate()
            }
        });

        this.webSockServerListener
      
        this.bInit = false
    }

    async start() {
        // listen-accept client
        this.webSockServerListener.on('connection'), function(c) {

        }
    }
}