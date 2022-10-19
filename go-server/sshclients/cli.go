package sshclients

import (
	//"io"
	"fmt"

	"golang.org/x/crypto/ssh"

	Events "github.com/skkim-01/wait-object/events"
)

type SSHClient struct {
	hEventIn chan interface{}
	hEventOut chan interface{}
}

func New() *SSHClient {
	return &SSHClient{
		hEventIn: Events.CreateSingleEvent(),
		hEventOut: Events.CreateSingleEvent(),
	} 
}

func (c *SSHClient) Connect(conninfo string) {
	go _sessionThread(c.hEventIn, c.hEventOut, 0)
}

func (c *SSHClient) Exec(cmd string) string {	
	Events.SetEvent(c.hEventIn, cmd)

	fmt.Println("#DBG\tExec\tWaitEvent")
	rawMsg := Events.WaitForSingleObject(c.hEventOut, 0)
	fmt.Println("#DBG\tExec\tresult:", rawMsg)
	return fmt.Sprintf("%v", rawMsg)
}

func _sessionThread(hInput chan interface{}, hOutput chan interface{}, ui64Timeout uint64) error {
	var err error
	
	config := &ssh.ClientConfig{
		User: "test",
		Auth: []ssh.AuthMethod{
			ssh.Password("1"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	connection, err := ssh.Dial("tcp", "192.168.219.107:22", config)
	if err != nil {
		fmt.Println("#ERR\tssh.Dial():", err)
		return err
	}
	defer connection.Close()

	session, err := connection.NewSession()
	if err != nil {
		fmt.Println("#ERR\tconn.NewSession():", err)
		return err
	}
	defer session.Close()

	streamIn, err := session.StdinPipe()
	if err != nil {
		fmt.Println("#ERR\tsession.StdinPipe():", err)
		return err
	}
	streamOut, err := session.StdoutPipe()
	if err != nil {
		fmt.Println("#ERR\tsession.StdoutPipe():", err)
		return err
	}
	// streamErr, err := session.StderrPipe()
	// if err != nil {
	// 	fmt.Println("#ERR\tsession.StderrPipe():", err)
	// 	return err
	// }

	fmt.Println("#DBG\tsession.Shell()")
	err = session.Shell()
	if err != nil {
		fmt.Println("#ERR\tsession.Shell():", err)
		return err
	}

	buffer := make([]byte, 65535)
	for {		
		fmt.Println("#DBG\tsession thread\twait event")
		rawMsg := Events.WaitForSingleObject(hInput, 0)
		// TODO: Mutex lock
		strEventMsg := fmt.Sprintf("%v", rawMsg)
		fmt.Println("#DBG\tsession thread\tcmd:", strEventMsg)
		if strEventMsg == "exit" {
			// Unlock
			break
		}

		fmt.Println("#DBG\tsession thread\tstreamIn")
		_, err := fmt.Fprintf(streamIn, "%s\n", strEventMsg)
		if err != nil {
			fmt.Println("fmt.fprintf:", err)
			Events.SetEvent(hOutput, err)
			// unlock
			continue
		}

		fmt.Println("#DBG\tsession thread\tio.ReadAll")
		_, err = streamOut.Read(buffer)
		if err != nil {
			fmt.Println("io.ReadAll:", err)
			Events.SetEvent(hOutput, err)
			// unlock
			continue
		}
		// unlock
		Events.SetEvent(hOutput, string(buffer))
	}

	fmt.Println("#dbg\tsession thread\tSession is closed")
	return nil
}