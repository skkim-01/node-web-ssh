const { Keypair, KeyHelper } = require('../util/keyhelper/keyhelper')
/*
MSG FORMAT
{
    "cmd" : " KEYEX | CONN | SHELL ",
    "result" : true | false,    // response only
    "body" : {        
        --- CONN
        "ip" : "1.2.3.4",
        "port" : "22",
        "user" : "asd",
        "password" : "qwe",
        ...
        --- SHELL
        "exe" : "ls -al"
    }
}
*/

class MSGHelper {
    static buildRequest( cmd, body ) {
        return JSON.stringify({
            cmd: cmd,
            body: body
        })
    }

    static builSecureRequest( cmd, body, pubkey ) 
    {
        return JSON.stringify({
            cmd: cmd,
            body: KeyHelper.encryptBase64(pubkey, body)
        })
    }

    static buildResponse( cmd, result, body ) {
        return JSON.stringify({
            cmd: cmd,
            result: result,
            body: body
        })
    }

    static buildSecureResponse( cmd, result, body, pubkey ) {
        return JSON.stringify({
            cmd: cmd,
            result: result,
            body: KeyHelper.encryptBase64(pubkey, body)
        })
    }

    static parseMessage( message ) {
        return JSON.parse(message)
    }

    static parseSecureMessage( message, keypair ) {
        let jsonObject = JSON.parse(message)
        jsonObject["body"] = keypair.decryptString(jsonObject["body"])
        return jsonObject
    }
}

module.exports = { MSGHelper }