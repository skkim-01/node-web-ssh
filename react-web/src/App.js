import './App.css';
import { useState, useRef, useEffect } from 'react'
import { WSClient } from "./objects/wsclient"

// TODO: How to import outside of root file?
const { MSGHelper } = require('./common/msg/msg')
const { Keypair } = require('./common/util/keyhelper/keyhelper')

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

  const textArea = useRef();
  useEffect(() => {
    const area = textArea.current;
    area.scrollTop = area.scrollHeight;
  });

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
    console.log('#INFO\tconConnect:start')

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
    console.log('#INFO\tonConnect:KEYEX:serverkey', serverPubkey)
    console.log('#INFO\tonConnect:KEYEX:clientkey', clientKeypair.getPublicKeyBase64())    

    // Request open ssh connection
    retv = await clientSocket.send(
      MSGHelper.buildSecureRequest(
        'CONN',
        JSON.stringify(default_option),
        serverPubkey
      )
    )
    console.log('onConnect:CONN', retv)
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
          cols="100"
          rows="30"
          resize="none"
          value={textOutput}
          readOnly={true}
          onChange={handleSetOutput}
          ref={textArea}          
        ></textarea>
      </header>
    </div>
  );
}

export default App;
