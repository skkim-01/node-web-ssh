/**
 * Created by skkim on 2018-12-26.
 */

 var express             = require('express');
 var bodyParser          = require('body-parser');
 var Orchestrator        = express();

 
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
    setTimeout(() => {resolve()}, 1000);
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

// TODO: MGR Class, client list
async function startWSServer() {
    var WebSocketServer = require('ws').Server
    var wss = new WebSocketServer({port: 9998});
    console.log('#INFO\tweb socket server service[:9998] is started');

    wss.on('connection', function(ws) {
        // TODO: accept processing code

        // TODO: recv (msg)
        ws.on('message', function(message) {
            console.log('#INFO\treceived: %s', message); 
            ws.send(message);
        });

        // TODO: close
        ws.on('close', () => {
            // TODO:
            console.log('#INFO\tev/close\t'); 
        });

        ws.send('welcome');
    });
}