package websock

import(
	"fmt"
	"net/http"
	"log"

	"github.com/gorilla/websocket"
	JsonMapper "github.com/skkim-01/json-mapper/src"

	"github.com/skkim-01/node-web-ssh/go-server/utils/ecies"
	"github.com/skkim-01/node-web-ssh/go-server/utils/conv"
)

func _start_wsserver_listener_thread() {
	// TODO: spinlock
	http.HandleFunc("/", _wshandler)

	// TODO: kill gracefully
	fmt.Println("#INFO\tTHREAD:WS\tWSServer is started with port :9998")
	fmt.Println()
	if err := http.ListenAndServe(":9998", nil) ; err != nil {
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

	for {
		fmt.Println()
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Printf("conn.ReadMessage: %v", err)
			return
		}

		strResponse := _handleMessage(p, privateKey, publicKey, &clientPublicKey)

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
		fmt.Println("#INFO\tTHRAD:WS\tKEYEX.Request")
		fmt.Println(jsonRequest.PPrint())

		// 1. set client key
		*clientPublicKey = fmt.Sprintf("%v", jsonRequest.Find("body"))

		// 2. make response
		jsonResponse.Insert("", "cmd", "KEYEX")
		jsonResponse.Insert("", "result", true)
		jsonResponse.Insert("", "body", publicKey.ToBase64())
		responseMsg = jsonResponse.Print()

		fmt.Println("#INFO\tTHRAD:WS\tKEYEX.Response")
		fmt.Println(jsonResponse.PPrint())
		break

	case "CONN":
		fmt.Println("#INFO\tTHRAD:WS\tCONN.Request")
		fmt.Println(jsonRequest.PPrint())
		
		byteConnInfo, _ := ecies.DecryptBase64(privateKey, fmt.Sprintf("%v", jsonRequest.Find("body")))
		connInfo := conv.Byte2string(byteConnInfo)
		//mapConninfo := fmt.Sprintf("%v", jsonRequest.Find("body"))
		fmt.Println("#DEBUG\tTHRAD:WS\tconnInfo", connInfo)
		// TODO: ssh connect

		// TODO: ssh connect result / message
		jsonResponse.Insert("", "cmd", "CONN")
		jsonResponse.Insert("", "result", true)
		jsonResponse.Insert("", "body", "success to connect")
		responseMsg = jsonResponse.Print()

		fmt.Println("#INFO\tTHRAD:WS\tCONN.Response")
		fmt.Println(jsonResponse.PPrint())
		break

	case "SHELL":
		fmt.Println("#INFO\tTHRAD:WS\tSHELL.Request")
		fmt.Println(jsonRequest.PPrint())

		shellCommand := fmt.Sprintf("%v", jsonRequest.Find("body"))
		fmt.Println("#DEBUG\tTHRAD:WS\tshellCommand", shellCommand)
		// TODO: ssh execute

		// TODO: ssh execute result
		exResult, _ := ecies.EncryptWithBase64(ecies.FromBase64ToPublicKey(*clientPublicKey), []byte("shell execute result"))
		jsonResponse.Insert("", "cmd", "SHELL")
		jsonResponse.Insert("", "result", true)
		jsonResponse.Insert("", "body", exResult)
		responseMsg = jsonResponse.Print()

		fmt.Println("#INFO\tTHRAD:WS\tSHELL.Response")
		fmt.Println(jsonResponse.PPrint())
		break

	default:
		responseMsg = `{"cmd": "ERROR", "result": false", "body": "invalid command" }`
	}
	return responseMsg
}