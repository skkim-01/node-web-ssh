const { SSHClient } = require('./sshclient')

// var ssh = new SSHClient()
// ssh.oneshot({
//   host : "192.168.219.107",
//   port : 22,
//   user : "test",
//   password : "1"
// })

// // end of process
// const exec = () => new Promise((resolve, reject) => {
//   setTimeout(() => {resolve(
//     ssh.oneshotexe()
//   )}, 3000);
//   // TODO: Close code
// });

// exec()

main()

async function main() {
  var default_opt =  {
    host : "192.168.219.107",
    port : 22,
    user : "test",
    password : "1"
  }

  console.log("1: new sshclient")
  ssh = new SSHClient()

  console.log("2: connect")
  var retv = await ssh.connect(default_opt)
  console.log("2: connect.result", retv)

  console.log("3: exec")
  var retv = await ssh.exec('ls')
  console.log("3: exec.result")
  console.log(retv)

  console.log("3: exec")
  var retv = await ssh.exec('ls -al')
  console.log("3: exec.result")
  console.log(retv)

  console.log("3: exec")
  var retv = await ssh.exec('lfaqwes -al')
  console.log("3: exec.result")
  console.log(retv)

  console.log("4: disconnect")
  var retv = await ssh.disconnect()
  console.log("4: disconnect.result", retv)

  console.log("5: fin")
}