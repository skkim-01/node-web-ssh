class conv {
    // buffer -> base64 string
    static buf2base64(byteData) {        
        return Buffer.from(byteData).toString('base64')
    }
    // base64 -> buffer
    static base642buf(strBase64) {
        return Buffer.from(strBase64, 'base64')
    }
    // buffer -> hex string
    static buf2hex(byteData) {
        return Buffer.from(byteData).toString('hex')        
    }
    // hex string -> base64
    static hex2buf(strBase64) {
        return Buffer.from(strBase64, 'hex')
    }

    static buf2utf8(byteData) {
        return Buffer.from(byteData).toString('utf-8')
    }
}

module.exports = { conv }