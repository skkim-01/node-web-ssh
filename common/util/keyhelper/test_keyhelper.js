const { Keypair, KeyHelper } = require('./keyhelper')

console.log("#INFO\tCreate Keypair\t")
testKey1 = new Keypair()
console.log("#INFO\tCreated Keypair:\t", testKey1)

console.log("#INFO\tpublickey bytes:\t", testKey1.getPublicKeyBuffer())
console.log("#INFO\tprivatekey bytes:\t", testKey1.getPrivateKeyBuffer())
console.log("#INFO\tpublickey base64:\t", testKey1.getPublicKeyBase64())
console.log("#INFO\tprivatekey base64:\t", testKey1.getPrivateKeyBase64())

console.log("")
console.log("#INFO\tLoad Keypair Bytes\t")
loadedKey = new Keypair()
loadedKey.loadBuffer(testKey1.getPrivateKeyBuffer())
console.log("#INFO\tpublickey base64:\t", loadedKey.getPublicKeyBase64())
console.log("#INFO\tprivatekey base64:\t", loadedKey.getPrivateKeyBase64())

console.log("")
console.log("#INFO\tLoad Keypair Base64\t")
loadedKey = new Keypair()
loadedKey.loadBase64(testKey1.getPrivateKeyBase64())
console.log("#INFO\tpublickey base64:\t", loadedKey.getPublicKeyBase64())
console.log("#INFO\tprivatekey base64:\t", loadedKey.getPrivateKeyBase64())

console.log("")
var plainData = JSON.stringify({
    order: 1,
    msg: "test data encryption"
})
console.log("#INFO\tplain data:\t", plainData)
base64Result = KeyHelper.encryptBase64(testKey1.getPublicKeyBase64(), plainData)
console.log("#INFO\tEncrypted data:\t", base64Result)
stringResult = testKey1.decryptString( base64Result )
console.log("#INFO\tDecrypted data:\t", stringResult)
console.log("")
console.log("#INFO\tEnd of test")