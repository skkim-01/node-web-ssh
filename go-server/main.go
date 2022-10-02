package main

import (
	"fmt"

	"net/http"

	"github.com/skkim-01/node-web-ssh/go-server/controller/v1"

	"github.com/skkim-01/node-web-ssh/go-server/websock"
)

func main() {
	http.HandleFunc("/v1/stat", v1.Stat)

	// websocket manager
	websock.GetInstance().Start()

	fmt.Println("#INFO\tServer is start with port :9999")
	http.ListenAndServe(":9999", nil)
}
