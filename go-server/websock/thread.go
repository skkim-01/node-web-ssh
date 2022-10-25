package websock

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	JsonMapper "github.com/skkim-01/json-mapper/src"

	"github.com/skkim-01/node-web-ssh/go-server/sshclients"
	"github.com/skkim-01/node-web-ssh/go-server/utils/conv"
	"github.com/skkim-01/node-web-ssh/go-server/utils/ecies"
)

func _start_wsserver_listener_thread() {
	// TODO: spinlock
	http.HandleFunc("/", _wshandler)

	// TODO: kill gracefully
	fmt.Println("#INFO\tTHREAD:WS\tWSServer is started with port :9998")
	fmt.Println()
	if err := http.ListenAndServe(":9998", nil); err != nil {
		log.Fatal(err)
	}
}

// github.com/gorilla/websocket
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func _wshandler(w http.ResponseWriter, r *http.Request) {
	// disable check origin
	// - https://pkg.go.dev/github.com/gorilla/websocket#hdr-Origin_Considerations
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrader.Upgrade: %v", err)
		return
	}
	defer conn.Close()

	// 1. create server key
	privateKey, publicKey, err := ecies.GenerateKey()
	// 2. client publickey
	clientPublicKey := ""
	if err != nil {
		log.Printf("ecies.GenerateKey: %v", err)
		return
	}
	// create ssh client object
	sshClient := sshclients.NewSSHClient()

	for {
		fmt.Println()
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Printf("conn.ReadMessage: %v", err)
			return
		}

		strResponse := _handleMessage(p, privateKey, publicKey, &clientPublicKey, sshClient)

		// messageType: websocket.BinaryMessage | websocket.TextMessage
		if err := conn.WriteMessage(messageType, []byte(strResponse)); err != nil {
			log.Printf("conn.WriteMessage: %v", err)
			return
		}
	}
}

func _handleMessage(
	rawData []byte,
	privateKey *ecies.ECDHPrivateKey,
	publicKey *ecies.ECDHPublicKey,
	clientPublicKey *string,
	sshClient *sshclients.SSHClient,
) string {
	jsonRequest, err := JsonMapper.NewBytes(rawData)
	if err != nil {
		log.Printf("JsonMapper.NewBytes: %v", err)
		return ""
	}
	responseMsg := ""
	jsonResponse, _ := JsonMapper.NewBytes([]byte("{}"))

	// same as 'server/manager/websock/wsmgr.js | async start() | message event'
	switch jsonRequest.Find("cmd") {
	case "KEYEX":
		fmt.Println("#INFO\tTHREAD:WS\tKEYEX.Request")
		fmt.Println(jsonRequest.PPrint())

		// 1. set client key
		*clientPublicKey = fmt.Sprintf("%v", jsonRequest.Find("body"))

		// 2. make response
		jsonResponse.Insert("", "cmd", "KEYEX")
		jsonResponse.Insert("", "result", true)
		jsonResponse.Insert("", "body", publicKey.ToBase64())
		responseMsg = jsonResponse.Print()

		fmt.Println("#INFO\tTHREAD:WS\tKEYEX.Response")
		fmt.Println(jsonResponse.PPrint())
		break

	case "CONN":
		fmt.Println("#INFO\tTHREAD:WS\tCONN.Request")
		fmt.Println(jsonRequest.PPrint())

		byteConnInfo, _ := ecies.DecryptBase64(privateKey, fmt.Sprintf("%v", jsonRequest.Find("body")))
		connInfo := conv.Byte2string(byteConnInfo)
		//mapConninfo := fmt.Sprintf("%v", jsonRequest.Find("body"))
		fmt.Println("#DEBUG\tTHREAD:WS\tconnInfo", connInfo)

		retv, err := sshClient.Conn(connInfo)
		if err != nil {
			jsonResponse.Insert("", "cmd", "CONN")
			jsonResponse.Insert("", "result", false)
			exResult, _ := ecies.EncryptWithBase64(
				ecies.FromBase64ToPublicKey(*clientPublicKey), []byte(err.Error()))
			jsonResponse.Insert("", "body", exResult)

		} else {
			jsonResponse.Insert("", "cmd", "CONN")
			jsonResponse.Insert("", "result", true)
			exResult, _ := ecies.EncryptWithBase64(
				ecies.FromBase64ToPublicKey(*clientPublicKey), []byte(retv))
			jsonResponse.Insert("", "body", exResult)
		}

		responseMsg = jsonResponse.Print()
		fmt.Println("#INFO\tTHREAD:WS\tCONN.Response")
		fmt.Println(jsonResponse.PPrint())
		break

	case "SHELL":
		fmt.Println("#INFO\tTHREAD:WS\tSHELL.Request")
		fmt.Println(jsonRequest.PPrint())

		//shellCommand := fmt.Sprintf("%v", jsonRequest.Find("body"))
		byteShellCommand, _ := ecies.DecryptBase64(privateKey, fmt.Sprintf("%v", jsonRequest.Find("body")))
		fmt.Println("#DEBUG\tTHREAD:WS\tshellCommand", string(byteShellCommand))

		retv, err := sshClient.Exec(string(byteShellCommand))
		if err != nil {
			jsonResponse.Insert("", "cmd", "SHELL")
			jsonResponse.Insert("", "result", false)
			exResult, _ := ecies.EncryptWithBase64(
				ecies.FromBase64ToPublicKey(*clientPublicKey), []byte(err.Error()))
			jsonResponse.Insert("", "body", exResult)

		} else {
			jsonResponse.Insert("", "cmd", "CONN")
			jsonResponse.Insert("", "result", true)
			exResult, _ := ecies.EncryptWithBase64(
				ecies.FromBase64ToPublicKey(*clientPublicKey), []byte(retv))
			jsonResponse.Insert("", "body", exResult)
		}
		// TODO: ssh execute result
		responseMsg = jsonResponse.Print()

		fmt.Println("#INFO\tTHREAD:WS\tSHELL.Response")
		fmt.Println(jsonResponse.PPrint())
		break

	default:
		responseMsg = `{"cmd": "ERROR", "result": false", "body": "invalid command" }`
	}
	return responseMsg
}
