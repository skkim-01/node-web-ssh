package main

import (
	"fmt"

	//"net/http"

	//"github.com/skkim-01/node-web-ssh/go-server/controller/v1"

	//"github.com/skkim-01/node-web-ssh/go-server/websock"

	
	"log"	
	"os"
	"golang.org/x/crypto/ssh"

	"github.com/skkim-01/node-web-ssh/go-server/sshclients"
)

func main() {
	// test mine
	testmine()	

	//testssh()

	// revert
	// http.HandleFunc("/v1/stat", v1.Stat)

	// // websocket manager
	// websock.GetInstance().Start()

	// fmt.Println("#INFO\tMAIN\tHttp server is started with port :9999")
	// http.ListenAndServe(":9999", nil)
}

func testmine() {

	client := sshclients.NewSSHClient()
	err := client.Connect("test")
	fmt.Println(err)
}

// TODO: handle signal
// https://pkg.go.dev/golang.org/x/crypto/ssh#Signal	


// hostkey callback issue: ssh: required host key was nil
// https://stackoverflow.com/questions/44269142/golang-ssh-getting-must-specify-hoskeycallback-error-despite-setting-it-to-n

func testssh() {
	//var hostKey ssh.PublicKey
	config := &ssh.ClientConfig{
		User: "test",
		Auth: []ssh.AuthMethod{
			ssh.Password("1"),
		},
		//HostKeyCallback: ssh.FixedHostKey(hostKey),
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	conn, err := ssh.Dial("tcp", "192.168.219.107:22", config)
	if err != nil {
		log.Fatal("unable to connect: ", err)
	}
	defer conn.Close()
	
	session, err := conn.NewSession()
	if err != nil { 
		log.Fatal("Failed to create session: ", err)
	}
	defer session.Close()

	// StdinPipe for commands
	stdin, err := session.StdinPipe()
	//_, err = sess.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}

	session.Stdout = os.Stdout
	session.Stderr = os.Stderr

	// Start remote shell
	err = session.Shell()
	if err != nil {
		log.Fatal(err)
	}

	// send the commands
	commands := []string{
		"ls -al",		
		"exit",
	}
	for _, cmd := range commands {
		_, err = fmt.Fprintf(stdin, "%s\n", cmd)
		if err != nil {
			log.Fatal(err)
		}
	}

	err = session.Wait()
	if err != nil {
		log.Fatal(err)
	}
}

