/**
 * Created by skkim on 2018-12-26.
 */

 var express             = require('express');
 var bodyParser          = require('body-parser');
 var Orchestrator        = express();

 
 //var conn = new WebSocket('wss://192.168.219.107:22')
 /*
  * TODO: Create Option files
  */
 // main setup
 Orchestrator.use(bodyParser.urlencoded({ extended:false }));
 // for json
 Orchestrator.use(bodyParser.json());
   
 /*
  * TODO: create route map file
  */
var stat = require('./router/stat.js');
Orchestrator.use('/stat', stat);

var conn = require('./router/test/sshconn.js')
Orchestrator.use('/test/sshconnn', conn);

console.log('#INFO\tServer Listening Port : 9999');
Orchestrator.listen(9999, function() {
    console.log('#INFO\thttp service[:9999] is started');
});

// WebSocket Server
startWSServer()

setInterval(() => {
    // app is running
}, 1000);

// end of process
const gracfulCleanJob = () => new Promise((resolve, reject) => {
    setTimeout(() => {resolve()}, 100);
    // TODO: Close code
});

// catch sigint(ctrl+c) signal
process.on('SIGINT', function() {
    //console.log("Caught interrupt signal");
    gracfulCleanJob().then(() => {
        process.exit();
    })
});


//////////////////////////////
// WebSocket Server
// https://www.npmjs.com/package/ws


// TODO: mgr
const { Client }    = require('ssh2');
const sshconn       = new Client()

// TODO: MGR Class, client list
async function startWSServer() {
    var WebSocketServer = require('ws').Server
    var wss = new WebSocketServer({port: 9998});
    console.log('#INFO\tweb socket server service[:9998] is started');

    wss.on('connection', function(ws) {
        // TODO: accept processing code
        // TODO: recv (msg)
        ws.on('message', function(message) {
            console.log('#INFO\tRaw Message: %s', message); 
            //ws.send("echo server:" + message);
            //retv = _parse(message)
            //ws.send(_parse(message, ws))
            _parse(message, ws)
        });

        // TODO: close
        ws.on('close', () => {
            // TODO:
            console.log('#INFO\tev/close\t'); 
        });

        ws.send('welcome');
    });
}

/*
MSG FORMAT
{
    "cmd" : " KEYEX | CONN | SHELL "
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

function _parse(raw, ws) {
    rawJson = JSON.parse(raw)

    // SSH connect
    if ( rawJson['cmd'] == "CONN" ) {
        // TODO: SSH CONNECT / Validate body
        sshconn.connect(rawJson['body'])        
        ws.send(_retv(true, "success"))

    // Send Command
    } else if ( rawJson['cmd'] == "SHELL" ) {
        // TODO: filter command: scp/vi

        sshconn.exec(rawJson['body'] , function(err, stream) {
            if (err) throw err;
            stream.on('close', function(code, signal) {              
            }).on('data', function(data) {
              ws.send(_retv(true, data.toString()))
            }).stderr.on('data', function(data) {
              ws.send(_retv(false, data.toString()))
            });
        });
        
    } else {
        ws.send(_retv(false, rawJson['cmd'] + ":\tinvalid command"))        
    }
}

function _retv(b, v) {
    return JSON.stringify({
        "result" : b,
        "body" : v
    })
}
