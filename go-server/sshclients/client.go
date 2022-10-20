// https://pkg.go.dev/golang.org/x/crypto/ssh#Client
// https://pkg.go.dev/golang.org/x/crypto/ssh#Session

// TODO:
// client.HandleChannelOpen
// session.CombinedOutput

package sshclients


import (
	"io"
	"fmt"

	"golang.org/x/crypto/ssh"
)

type SSHCli struct {
	connection		*ssh.Client
	session			*ssh.Session
	streamIn		io.WriteCloser
	streamOut 		io.Reader
	streamErr		io.Reader
}

func NewSSHClient() *SSHCli {
	return &SSHCli {}
}

func (c *SSHCli) Close() {
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

func (c *SSHCli) Conn(conninfo string) (string, error) {
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

	err = c.session.Shell()
	if err != nil {
		fmt.Println("#ERR\tsession.Shell():", err)
		return "", err
	}

	buffer := make([]byte, 65535)
	_, err = c.streamOut.Read(buffer)
	if err != nil {
		fmt.Println("io.ReadAll:", err)
		return "", err
	}
	
	return string(buffer), nil
}

func (c *SSHCli) MSG(msg string) (string, error) {
	fmt.Println("test@test >", msg)
	buffer := make([]byte, 65535)
	_, err := fmt.Fprintf(c.streamIn, "%s\n", msg)
	if err != nil {
		return "", err
	}
	_, err = c.streamOut.Read(buffer)
	if err != nil {
		return "", err	
	}
	return string(buffer), nil
}

