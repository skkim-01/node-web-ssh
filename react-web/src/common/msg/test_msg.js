const { MSGHelper } = require('./msg')
const { Keypair, KeyHelper } = require('../util/keyhelper/keyhelper')

testKey = new Keypair()

console.log("#INFO\tCreate Keypair\t")
result = MSGHelper.buildRequest("test", "asd")
console.log(result)
pmsg = MSGHelper.parseMessage(result)
console.log(pmsg)

result = MSGHelper.builSecureRequest("test", 
    JSON.stringify({ key: 1, value: "bob" }),
    testKey.getPublicKeyBuffer())
console.log(result)

parsed = MSGHelper.parseSecureMessage(
    result, testKey
)
console.log(parsed)
