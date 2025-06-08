package mail

import (
	"fmt"
	"net/smtp"
)

type MailClient interface {
	Send(to, subject, body string) error
}

type smtpClient struct {
	auth smtp.Auth
	addr string
	from string
}

func New(host string, port int, username, password, from string) MailClient {
	addr := fmt.Sprintf("%s:%d", host, port)
	auth := smtp.PlainAuth("", username, password, host)
	return &smtpClient{
		auth: auth,
		addr: addr,
		from: from,
	}
}

func (c *smtpClient) Send(to, subject, body string) error {
	msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s", to, subject, body))
	return smtp.SendMail(c.addr, c.auth, c.from, []string{to}, msg)
}
