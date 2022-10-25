package main

import (
	"fmt"

	"net/http"

	v1 "github.com/skkim-01/node-web-ssh/go-server/controller/v1"

	"github.com/skkim-01/node-web-ssh/go-server/websock"

	"github.com/skkim-01/node-web-ssh/go-server/sshclients"
)

func main() {
	http.HandleFunc("/v1/stat", v1.Stat)

	//websocket manager
	websock.GetInstance().Start()

	fmt.Println("#INFO\tMAIN\tHttp server is started with port :9999")
	http.ListenAndServe(":9999", nil)

	// TODO: test ssh client code. will be remove
	//testssh()
}

func testssh() {
	var msg string
	var err error
	c := sshclients.NewSSHClient()

	c.Close()

	greetings, err := c.Conn("")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.connect\t", err)
		return
	}
	fmt.Println(greetings)

	msg, err = c.Exec("pwd")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	// TODO: Check invalid directory
	msg, err = c.Exec("cd asd")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	// ls -al
	msg, err = c.Exec("ls -al")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	// test cd
	msg, err = c.Exec("cd /var/log")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	// check
	msg, err = c.Exec("ls -al")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	// TODO: buffer overflow
	// msg, err = c.Exec("cat syslog")
	// if err != nil {
	// 	fmt.Println("#ERROR\tsshclient.msg\t", err)
	// 	return
	// }
	// fmt.Println(msg)

	// test error message
	msg, err = c.Exec("asd")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	// deny message
	msg, err = c.Exec("vi")
	if err != nil {
		fmt.Println("#ERROR\tsshclient.msg\t", err)
		return
	}
	fmt.Println(msg)

	c.Close()
}

// TODO: handle signal
// https://pkg.go.dev/golang.org/x/crypto/ssh#Signal

// hostkey callback issue: ssh: required host key was nil
// https://stackoverflow.com/questions/44269142/golang-ssh-getting-must-specify-hoskeycallback-error-despite-setting-it-to-n
