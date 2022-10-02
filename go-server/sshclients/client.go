// https://pkg.go.dev/golang.org/x/crypto/ssh#Client
package sshclients

// TODO: channel?

// TODO: Test - 
//  1. open shell thread
//  2. make channel: io.writer io.reader
// 

import (
	"io"
	"fmt"

	"golang.org/x/crypto/ssh"
)

type SSHClient struct {
	connection		*ssh.Client
	session			*ssh.Session
	streamIn		io.WriteCloser
	streamOut 		io.Reader
	streamErr		io.Reader
}

func NewSSHClient() *SSHClient {
	return &SSHClient {}
}

// 192.168.219.107 / 22 / test /1
// currently connect hard coded local env..
func (c *SSHClient) Connect(conninfo string) error {
	var err error
	config := &ssh.ClientConfig{
		User: "test",
		Auth: []ssh.AuthMethod{
			ssh.Password("1"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	c.connection, err = ssh.Dial("tcp", "192.168.219.107:22", config)
	if err != nil {
		return err
	}
	defer c.connection.Close()

	c.session, err = c.connection.NewSession()
	if err != nil {
		return err
	}
	defer c.session.Close()

	c.streamIn, err = c.session.StdinPipe()
	if err != nil {
		return err
	}

	c.streamOut, err = c.session.StdoutPipe()
	if err != nil {
		return err
	}

	c.streamErr, err = c.session.StderrPipe()
	if err != nil {
		return err
	}	

	fmt.Println("shell")
	err = c.session.Shell()
	if err != nil {
		return err
	}

	fmt.Println("StreamIn")
	fmt.Fprint(c.streamIn, "ls -al\nexit\n")

	fmt.Println("Wait")
	c.session.Wait()

	fmt.Println("ReadAll")
	buffer, err := io.ReadAll(c.streamOut)
	if err != nil {
		return err
	}
	fmt.Println(string(buffer))

	fmt.Println("Done")
	return nil
}