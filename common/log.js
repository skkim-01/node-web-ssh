
class Logger {
    static dbg(...args) {
        var result = new Date().toISOString().replace('T', ' ').substr(0, 19)
            + '\t'
            + 'INFO'
            + '\t'

        for ( var i = 0 ; i < args.length ; i++ ) {
            result += ' '
            result += args[i]
        }
        console.log(result)
    }
}

module.exports = {Logger}