package rabbitmq

import (
	"fmt"
	"log"
	"time"
	amqp "github.com/rabbitmq/amqp091-go"
)

type MQConnection struct {
	Conn    *amqp.Connection
	Channel *amqp.Channel
}

func ConnectRabbitMQ(uri string) (*MQConnection, error) {
	conn, err := amqp.DialConfig(uri, amqp.Config{
		Heartbeat: 10 * time.Second,
		Locale:    "en_US",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("failed to open a channel: %w", err)
	}

	return &MQConnection{
		Conn:    conn,
		Channel: ch,
	}, nil
}

func (mq *MQConnection) Close() {
	if mq.Channel != nil {
		if err := mq.Channel.Close(); err != nil {
			log.Printf("failed to close channel: %v", err)
		}
	}
	if mq.Conn != nil {
		if err := mq.Conn.Close(); err != nil {
			log.Printf("failed to close connection: %v", err)
		}
	}
}
