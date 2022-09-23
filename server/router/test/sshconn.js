var express         = require('express')
var router          = express.Router()
const { Client }    = require('ssh2');

// one-shot ssh connect test
router.get('/', function(req, res, next) {
    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.shell((err, stream) => {
            if (err) throw err;

            stream.on('close', () => {
                    console.log('Stream :: close');
                    conn.end();
                }).on('data', (data) => {
                    console.log('OUTPUT: ' + data);
                });
                stream.end('ls -l\nexit\n');
            });
        }).connect({
            host: '172.26.101.214',
            port: 22,
            username: 'test',
            password: '1'
    });

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('200 OK')
});

module.exports = router;