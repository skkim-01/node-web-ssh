const { Client }    = require('ssh2');

class SSHConnMgr {
    static _Instance = null;

    static getInstance() {
        if (SSHConnMgr._Instance == null) {
            SSHConnMgr._Instance = new SSHConnMgr();
        }
        return this._Instance;
    }

    bInit = false
    webSockServerListener = null

    init() {
        
    }

    fin() {
        
    }

    connect() {
        const c = new Client();
        c.on( 'ready', () => {
            console.log('#INFO\tNew SSH Client is ready')
        })
        return c
    }
}