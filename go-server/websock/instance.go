package websock

import (
	//"fmt"
	"sync"
)

//ws://localhost:9998
type WSServerManager struct {	
}

var instance *WSServerManager
var once sync.Once

func GetInstance() *WSServerManager {
	once.Do(func() {
		instance = &WSServerManager{}
	})
	return instance
}

func (i *WSServerManager) Start() {
	go _start_wsserver_listener_thread()
}

func Fin() {

}