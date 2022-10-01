import './App.css';
import { useState } from 'react'
import { WSClient } from "./objects/wsclient"

// TODO: How to import outside of root file?
const { MSGHelper } = require('./common/msg/msg')
const { Keypair } = require('./common/util/keyhelper/keyhelper')
const { Logger } = require('./common/log')

const default_option = {
  host: '192.168.219.107',
  port: 22,
  username: 'test',
  password: '1'
}

function App() {
  const [textOutput, setTextOutput] = useState("");
  const [textValue, setTextValue] = useState("");
  const [clientKeypair] = useState(new Keypair())
  const [serverPubkey, setServerPubkey] = useState('');
  const [clientSocket] = useState(new WSClient())

  const handleSetValue = (e) => {
    setTextValue(e.target.value);
  };
  const handleOnKeyPress = (e) => {
    // TODO: filter command
    if (e.key === 'Enter') {
      sendShellCommand(textValue).then( (result) => {        
        var message = clientKeypair.decryptString(JSON.parse(result)['body'])
        console.log(message)
        var newText = textOutput + '\n' + message
        setTextOutput(newText)        
      })      
      setTextValue('')
    }
  }
  const handleSetOutput = (e) => {
    setTextOutput(e.target.value)
  }

  const onConnect = async () => {
    Logger.dbg('onConnect:start')

    // Connect Socket
    await clientSocket.connect('ws://localhost:9998')

    // Key Exchange
    var retv = await clientSocket.send(
      MSGHelper.buildRequest(
        "KEYEX", 
        clientKeypair.getPublicKeyBase64()
      )
    )
    var jsonRetv = JSON.parse(retv)
    if ( jsonRetv['result'] ) {
      setServerPubkey(jsonRetv['body'])      
    }
    Logger.dbg('onConnect:KEYEX:serverkey', serverPubkey)
    Logger.dbg('onConnect:KEYEX:clientkey', clientKeypair.getPublicKeyBase64())    

    // Request open ssh connection
    retv = await clientSocket.send(
      MSGHelper.buildSecureRequest(
        'CONN',
        JSON.stringify(default_option),
        serverPubkey
      )
    )
    Logger.dbg('onConnect:CONN', retv)    
  }

  const onDisconnect = () => {
    clientSocket.close()    
  }

  const sendShellCommand = async (shCmd) => {
    return await clientSocket.send(
      MSGHelper.buildSecureRequest(
        "SHELL",
        shCmd,
        serverPubkey
      )
    )    
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={ async () => { await onConnect() } }>test_open</button>
        <button onClick={ onDisconnect }>test_close</button>
        <p> INPUT </p>
        <input
          type="text"
          value={textValue}
          onChange={handleSetValue}
          onKeyPress={ handleOnKeyPress }
        />
        <p> OUTPUT </p>
        <textarea
          value={textOutput}
          onChange={handleSetOutput}
        ></textarea>
      </header>
    </div>
  );
}

export default App;
