const crypto = require('crypto')
const { CryptoHelper } = require('../cryptohelper/cryptohelper')

const _curve_name = 'secp256k1'

// class _privateKey {
//     D       // []byte
// }

// class _publicKey {
//     Curve   // curve: SECP256K1
//     X       // BigInt
//     Y       // BigInt
// }

class Keypair {
    curve               = null      // ECDH Curve
    privateKey          = null      // private key buffer
    publicKey           = null      // public key buffer
    iv                  = null      // enc-dec iv

    constructor() {
        this.curve = crypto.createECDH(_curve_name)
    }

    // generate new keypair
    gen() {        
        this.curve.generateKeys()
        this.privateKey = this.curve.getPrivateKey('base64')
        this.publicKey = this.curve.getPublicKey('base64')
        this.iv = this.curve.getPrivateKey().slice(0, 16)
    }

    load(strBase64PrivateKey) {
        this.curve.setPrivateKey(strBase64PrivateKey, 'base64')
        this.privateKey = this.curve.getPrivateKey('base64')
        this.publicKey = this.curve.getPublicKey('base64')
        this.iv = this.curve.getPrivateKey().slice(0, 16)
    }

    encrypt(strPlainText) {
        CryptoHelper.encrypt( strPlainText, this.publicKey, this.iv )
    }
}

let keypair = new Keypair()
keypair.gen()
console.log(keypair)


// Keypair {
//     curve: ECDH { [Symbol(kHandle)]: ECDH {} },
//     privateKey: 'vdjDWjjp6uoWvAQmegbIUmypQ447EEk9fTUjDrZx6eM=',
//     publicKey: 'BI+Bts7o7M45OrF2UXZAlPc0eDpUyFdseLqI7l8mW6jvDVVugEyKrUY5MOkEIwW+Beulz75GknygHfcJvZtKUho='       
//   }
let loadkeypair = new Keypair()
loadkeypair.load('vdjDWjjp6uoWvAQmegbIUmypQ447EEk9fTUjDrZx6eM=')
console.log(loadkeypair)