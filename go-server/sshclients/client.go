// https://pkg.go.dev/golang.org/x/crypto/ssh#Client
// https://pkg.go.dev/golang.org/x/crypto/ssh#Session

// TODO: vi...?

package sshclients

import (
	"fmt"
	"io"
	"strings"
	"sync"

	"golang.org/x/crypto/ssh"

	Events "github.com/skkim-01/wait-object/events"
)

// MSG Mutex
var lockMutex sync.Mutex

// waitgroup for initialize
var wg sync.WaitGroup

type SSHClient struct {
	connection *ssh.Client
	session    *ssh.Session
	streamIn   io.WriteCloser
	streamOut  io.Reader
	streamErr  io.Reader
	hEvent     chan interface{}
}

func NewSSHClient() *SSHClient {
	return &SSHClient{
		hEvent: Events.CreateSingleEvent(),
	}
}

func (c *SSHClient) Close() {
	// TODO: Close & Reopen Event
	if c.streamIn != nil {
		defer c.streamIn.Close()
	}
	if c.streamOut != nil {
		defer c.streamIn.Close()
	}
	if c.streamErr != nil {
		defer c.streamIn.Close()
	}
	if c.session != nil {
		defer c.session.Close()
	}
	if c.connection != nil {
		defer c.connection.Close()
	}
}

func (c *SSHClient) Conn(conninfo string) (string, error) {
	var err error

	// TODO: parse conninfo
	// TODO: other authentications
	config := &ssh.ClientConfig{
		User: "test",
		Auth: []ssh.AuthMethod{
			ssh.Password("1"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	//c.connection, err = ssh.Dial("tcp", "192.168.219.107:22", config)
	c.connection, err = ssh.Dial("tcp", "172.20.151.2:22", config)
	if err != nil {
		return "", err
	}

	c.session, err = c.connection.NewSession()
	if err != nil {
		return "", err
	}

	c.streamIn, err = c.session.StdinPipe()
	if err != nil {
		return "", err
	}

	c.streamOut, err = c.session.StdoutPipe()
	if err != nil {
		return "", err
	}

	c.streamErr, err = c.session.StderrPipe()
	if err != nil {
		return "", err
	}

	// message pump threads. wait initialized
	wg.Add(2)
	go c.__stdout_pump(c.hEvent)
	go c.__stderr_pump(c.hEvent)
	wg.Wait()

	// start shell
	err = c.session.Shell()
	if err != nil {
		fmt.Println("#ERR\tsession.Shell():", err)
		return "", err
	}

	// out greeting message
	retv := c._msgAggregator()
	return retv, nil
}

// Exec: Execute shell command
func (c *SSHClient) Exec(msg string) (string, error) {
	fmt.Println("test@test >", msg)

	isDeny, isRead := c._msgFilter(msg)
	if isDeny {
		return fmt.Sprintf("ERROR: [%v] command is currently not supported", msg), nil
	}

	_, err := fmt.Fprintf(c.streamIn, "%s\n", msg)
	if err != nil {
		return "", err
	}

	if !isRead {
		return "", nil
	}

	retv := c._msgAggregator()
	return retv, nil
}

/*
 *		private functions
 */

// _msgFilter : check command: deny or no wait
func (c *SSHClient) _msgFilter(msg string) (isDeny bool, isRead bool) {
	slicedString := strings.Split(msg, " ")

	switch slicedString[0] {
	case "cd":
		return false, false

	case "vi":
		return true, false

	default:
		return false, true
	}
}

// _msgAggregator: message aggregator (stdout | stderr)
func (c *SSHClient) _msgAggregator() string {
	// TODO: is it needed?
	lockMutex.Lock()
	retv := Events.WaitForSingleObject(c.hEvent, 0)
	lockMutex.Unlock()

	return fmt.Sprintf("%v", retv)
}

// __stderr_pump: message pump thread. it will be closed when c.streamErr is closed
func (c *SSHClient) __stderr_pump(hEvent chan interface{}) {
	defer func() {
		recover()
	}()

	var err error
	var nBytesRead int
	wg.Done()

	for {
		buffer := make([]byte, 65535)
		nBytesRead, err = c.streamErr.Read(buffer)
		if err != nil {
			Events.SetEvent(hEvent, err.Error())
			continue
		}
		Events.SetEvent(hEvent, string(buffer[:nBytesRead]))
		continue
	}
}

// __stdout_pump: message pump thread. it will be closed when c.streamOut is closed
func (c *SSHClient) __stdout_pump(hEvent chan interface{}) {
	defer func() {
		recover()
	}()

	var err error
	var nBytesRead int
	wg.Done()

	for {
		buffer := make([]byte, 65535)
		nBytesRead, err = c.streamOut.Read(buffer)
		if err != nil {
			Events.SetEvent(hEvent, err.Error())
			continue
		}
		Events.SetEvent(hEvent, string(buffer[:nBytesRead]))
		continue
	}
}
