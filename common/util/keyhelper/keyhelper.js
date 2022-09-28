// Asymmetric Key Helper

const crypto = require('crypto')
const { conv } = require('../conv')

const _curve_name = 'secp256k1'
const _default_iv = '0123456789abcdef'

class Keypair {
    curve               = null      // ECDH Curve

    constructor() {
        this.curve = crypto.createECDH(_curve_name)
        this.generate()
    }

    // generate new keypair
    generate() {
        this.curve.generateKeys()
    }

    // load curve from private key
    loadBase64(base64PrivateKey) {
        this.curve.setPrivateKey(base64PrivateKey, 'base64')
    }

    loadBuffer(bufferPrivateKEy) {
        this.curve.setPrivateKey(bufferPrivateKEy)
    }

    getPublicKeyBuffer() {
        return this.curve.getPublicKey()
    }

    getPrivateKeyBuffer() {
        return this.curve.getPrivateKey()
    }

    getPublicKeyBase64() {
        return this.curve.getPublicKey('base64')
    }

    getPrivateKeyBase64() {
        return this.curve.getPrivateKey('base64')
    }

    decryptBuffer( cipherData ) {
        var byteData
        if ( typeof cipherData == 'string' ) {
            byteData = conv.base642buf(cipherData)
        } else {
            byteData = cipherData
        }

        return this._decryptData( byteData )
    }

    decryptString( cipherData ) {
        var byteData
        if ( typeof cipherData == 'string' ) {
            byteData = conv.base642buf(cipherData)
        } else {
            byteData = cipherData
        }

        return this._decryptData( byteData ).toString()
    }

    // private functions

    // decrypt with this.private key. returns buffer
    _decryptData( cipherData ) {
        const R = cipherData.slice(0, 65)
        const c = cipherData.slice(65, cipherData.length - 32)
        const d = cipherData.slice(cipherData.length-32, cipherData.length)

        const sharedSecret = this.curve.computeSecret(R)
        const sha256HashedSecret = crypto.createHash('sha256').update(Buffer.concat([sharedSecret], sharedSecret.length)).digest()
        const encrypionKey = sha256HashedSecret.slice(0, sha256HashedSecret.length/2)
        const macKey = sha256HashedSecret.slice(sha256HashedSecret.length/2, sha256HashedSecret.length)
        const tag = crypto.createHmac('sha256', macKey).update(Buffer.concat([c], c.length)).digest()    
        if (!this._compareTag(tag, d)) return false
        const decipher = crypto.createDecipheriv('aes-128-cbc', encrypionKey, _default_iv)
        const lPart = decipher.update(c)
        const rPart = decipher.final();
        return Buffer.concat([lPart, rPart])
    }

    // compare shared secret tag in decryption
    _compareTag(b1, b2) {
        if (b1.length !== b2.length) {
            return false;
        }
        let result = 0;
        for (let i = 0; i < b1.length; i++) {
            result |= b1[i] ^ b2[i];  // jshint ignore:line
        }
        return result === 0;
    }
}

class KeyHelper {
    static isValidPubKey( pubKey ) {
        var byteKey

        if( typeof pubKey == "string" ) {
            byteKey = conv.base642buf(pubKey)
        }else {
            byteKey = pubKey
        }

        if( byteKey.length == 65 ) return true
        else return false
    }

    static encryptBuffer( pubKey, plainData ) {
        var byteKey

        if( typeof pubKey == "string" ) {
            byteKey = conv.base642buf(pubKey)
        }else {
            byteKey = pubKey
        }

        return this._encryptData(byteKey, plainData)
    }

    static encryptBase64( pubKey, plainData) {
        var byteKey

        if( typeof pubKey == "string" ) {
            byteKey = conv.base642buf(pubKey)
        }else {
            byteKey = pubKey
        }

        return conv.buf2base64( this._encryptData(byteKey, plainData) )
    }

    // encrypt with public key. returns buffer
    _encryptData( pubKey, plainData ) {
        const tmpKey = new Keypair()
        const R = tmpKey.getPublicKeyBuffer()
        const sharedSecret = tmpKey.curve.computeSecret(pubKey)
        const sha256HashedSecret = crypto.createHash('sha256').update(Buffer.concat([sharedSecret], sharedSecret.length)).digest();
        const encrypionKey = sha256HashedSecret.slice(0, sha256HashedSecret.length/2)
        const macKey = sha256HashedSecret.slice(sha256HashedSecret.length/2, sha256HashedSecret.length)
        let cipher = crypto.createCipheriv('aes-128-cbc', encrypionKey, _default_iv);
        const lPart = cipher.update(plainData)
        const rPart = cipher.final()
        const cipherText = Buffer.concat([lPart, rPart])
        const tag = crypto.createHmac('sha256', macKey).update(Buffer.concat([cipherText], cipherText.length)).digest()
        return Buffer.concat([R, cipherText, tag]);
    }
}

module.exports = { Keypair, KeyHelper }