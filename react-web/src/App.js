import logo from './logo.svg';
import { useState } from 'react'
import './App.css';

import { w3cwebsocket as W3CWebSocket } from "websocket";
const client = new W3CWebSocket('ws://localhost:9998');
client.onopen = () => {
  console.log('WebSocket Client Connected');
};
client.onmessage = (message) => {
  console.log(message.data);
};
client.onerror = () => {
  console.log('Connection Error');
};
client.onclose = () => {
  console.log('socket closed');
}

function App() {
  const [textValue, setTextValue] = useState("");
  const handleSetValue = (e) => {
    //console.log(e.target.value);
    setTextValue(e.target.value);
  };
  const handleOnKeyPress = (e) => {
    // e.preventDefault();
    //console.log("keypress", e.target.value);
    //setTextValue(e.target.value);

    if (e.key === 'Enter') {
      console.log("enter is pressed", e.target.value);
      _sendSSH(textValue)
      setTextValue('')
    }    
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={onClickConnect}>test_open</button>
        <button onClick={onClickDisconnect}>test_close</button>
        <p> INPUT </p>
        <input
          type="text"
          value={textValue}
          onChange={handleSetValue}
          onKeyPress={handleOnKeyPress}
        />
        <p> OUTPUT </p>
        
      </header>
    </div>
  );
}


function onClickDisconnect() {
  console.log("onClose")
  client.close();
}

function onClickConnect() {
  console.log("192.168.219.107:22")

  // TODO: check connection state
  // if ( client.readyState != 0 /* CONNECTING */) {
  //   client.OPEN()
  // }

  client.send( _build("CONN", {
    "host" : "192.168.219.107",
    "port" : 22,
    "user" : "test",
    "password" : "1"
  }) )
}

function _sendSSH( shCmd ) {
  console.log("sendSSH") 
  client.send( _build( "SHELL", shCmd ) )
}

function _build( msg, param ) {
  return JSON.stringify({
    "cmd" : msg,
    "body" : param
  })
}


export default App;
