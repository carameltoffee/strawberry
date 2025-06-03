package config

import (
	"time"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	App struct {
		Port int `envconfig:"REST_PORT" default:"8080"`
	}
	Database struct {
		User     string `envconfig:"DB_USER" required:"true"`
		Password string `envconfig:"DB_PASSWORD" required:"true"`
		Host     string `envconfig:"DB_HOST" default:"localhost"`
		Port     string `envconfig:"DB_PORT" default:"5432"`
		Name     string `envconfig:"DB_NAME" required:"true"`
		SSLMode  string `envconfig:"DB_SSLMODE" default:"disable"`
	}
	Jwt struct {
		SecretKey string        `envconfig:"SECRET_KEY" required:"true"`
		TTL       time.Duration `envconfig:"TTL" required:"true"`
	}
	RabbitMq struct {
		Uri string `envconfig:"RABBITMQ_URL" default:"amqp://guest:guest@rabbitmq:5672/"`
	}
}

func MustLoad() Config {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		panic("cannot load config!!")
	}
	return cfg
}
