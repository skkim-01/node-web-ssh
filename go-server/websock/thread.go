package websock

import(
	"fmt"
	"net/http"
	"log"
	"github.com/gorilla/websocket"
)

func _start_wsserver_listener_thread() {	
	fmt.Println("thread:_start is started")

	// spinlock
	http.HandleFunc("/", _wshandler)

	fmt.Println("thread:_start is started: 9998")
	if err := http.ListenAndServe(":9998", nil) ; err != nil {
		log.Fatal(err)
	}	
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,	
}


func _wshandler(w http.ResponseWriter, r *http.Request) {
	// disable check origin
	// - https://pkg.go.dev/github.com/gorilla/websocket#hdr-Origin_Considerations
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	defer conn.Close()

	if err != nil {
		log.Printf("upgrader.Upgrade: %v", err)
		return
	}

	for {
		messageType, p, err := conn.ReadMessage()
		fmt.Println(messageType, string(p))		

		if err != nil {
			log.Printf("conn.ReadMessage: %v", err)
			return
		}
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Printf("conn.WriteMessage: %v", err)
			return
		}
	}
}

func handleMessage(strRaw string) {

}