import './App.css';
import { useState } from 'react'
import { WSClient } from "./objects/wsclient"

// TODO: How to import outside of root file?
const { MSGHelper } = require('./common/msg/msg')
const { Keypair } = require('./common/util/keyhelper/keyhelper')

function App() {
  const [textOutput, setTextOutput] = useState("");
  const [textValue, setTextValue] = useState("");
  const [clientKeypair] = useState(new Keypair())
  //const [serverPubkey, setServerPubkey] = useState('');
  const [clientSocket] = useState(new WSClient())

  const handleSetValue = (e) => {
    setTextValue(e.target.value);
  };
  const handleOnKeyPress = (e) => {
    // TODO: CTRL+C
    if (e.key === 'Enter') {
      _sendSSH(textValue)
      setTextValue('')
    }
  }
  const handleSetOutput = (e) => {
    setTextOutput(e.target.value)
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={ () => onClickConnect(clientKeypair.getPublicKeyBase64(), clientSocket)}>test_open</button>
        <button onClick={onClickDisconnect}>test_close</button>
        <p> INPUT </p>
        <input
          type="text"
          value={textValue}
          onChange={handleSetValue}
          onKeyPress={handleOnKeyPress}
        />
        <p> OUTPUT </p>
        <textarea
          value={textOutput}
          onChange={(e) => handleSetOutput(e)}
        ></textarea>
      </header>
    </div>
  );
}


function onClickDisconnect() {
  console.log("onClose")
  // client.close();
}

async function onClickConnect(base64key, clientSocket) {
  console.log("192.168.219.107:22")
  console.log(base64key)

  await clientSocket.connect('ws://localhost:9998')
  console.log('connected')
  var retv = await clientSocket.send(MSGHelper.buildRequest("KEYEX", base64key))
  console.log(retv)

  return
}

function _sendSSH( shCmd ) {
  console.log("sendSSH") 
}

function _build( msg, param ) {
  return JSON.stringify({
    "cmd" : msg,
    "body" : param
  })
}


export default App;
