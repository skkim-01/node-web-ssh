// TODO: mgr
const { Client }    = require('ssh2');
const { CryptoHelper }  = require('../common/util/cryptohelper/cryptohelper')
// const conn = new Client();
// conn.connect({
//     host: '192.168.219.107',
//     port: 22,
//     username: 'test',
//     password: '1'
// });

retv = CryptoHelper.encrypt('test plain data', '2219551')
console.log(retv)

retv = CryptoHelper.decrypt(retv['data'], '2219551', retv['iv'])
console.log(retv)
//asyncMain()

async function asyncMain() {
    console.log("asyncMain:start")    
    //await asyncExec(conn);
    exec('ls -al')
    exec('cat .viminfo | grep 4')

    // result = await asyncExec('ls -al')
    // console.log(result)

    // result2 = await asyncExec('df -h')
    // console.log(result2)
    console.log("asyncMain:end")
}

// // end of process
// const gracfulCleanJob = () => new Promise((resolve, reject) => {
//     setTimeout(() => {resolve()}, 100);
//     // TODO: Close code
// });

// // catch sigint(ctrl+c) signal
// process.on('SIGINT', function() {
//     //console.log("Caught interrupt signal");
//     gracfulCleanJob().then(() => {
//         process.exit();
//     })
// });


function exec(cmd) {
    conn.on('ready', function() {
        conn.exec(cmd, function(err, stream) {
            if (err) throw err;
            stream.on('close', function(code, signal) {
              console.log('SSH Stream :: close :: code: ' + code + ', signal: ' + signal);

            }).on('data', function(data) {
              console.log('STDOUT: ' + data);
            }).stderr.on('data', function(data) {
              console.log('STDERR: ' + data);
            });
      });
    })
}

async function asyncExec(cmd) {
    return new Promise((resolve, reject) => {
        return exeFunction(resolve, reject, cmd)
    })
}


// functions
function exeFunction(resolve, reject, cmd) {
    var retv;
    console.log("exeFunction:cmd", cmd)
    conn.on('ready', function() { 
      conn.exec(cmd, function(err, stream) {
          console.log("stream")
        if (err) throw err;  
        stream.on('close', function(code, signal) {
            //console.log(retv)
            console.log(stream.eof())
            console.log(stream.close())
            resolve();            
        }).on('data', function(data) {          
            console.log(data)
            
            
        }).stderr.on('data', function(data) {          
            console.log(data)
            
            
        });
      })
    })
  };