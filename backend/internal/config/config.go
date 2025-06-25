package config

import (
	"time"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	App struct {
		Port int `envconfig:"PORT" default:"8080"`
	}
	Database struct {
		User     string `envconfig:"PGUSER" required:"true"`
		Password string `envconfig:"PGPASSWORD" required:"true"`
		Host     string `envconfig:"PGHOST" default:"localhost"`
		Port     string `envconfig:"PGPORT" default:"5432"`
		Name     string `envconfig:"PGDATABASE" required:"true"`
		SSLMode  string `envconfig:"DB_SSLMODE" default:"disable"`
	}
	Jwt struct {
		SecretKey string        `envconfig:"SECRET_KEY" required:"true"`
		TTL       time.Duration `envconfig:"TTL" required:"true"`
	}
	RabbitMq struct {
		Uri string `envconfig:"RABBITMQ_URL" default:"amqp://guest:guest@rabbitmq:5672/"`
	}
	Minio struct {
		AccessKey string `envconfig:"MINIO_ROOT_USER" required:"true"`
		SecretKey string `envconfig:"MINIO_ROOT_PASSWORD" required:"true"`
		SslMode   bool   `envconfig:"MINIO_SSLMODE" default:"false"`
		Port      int    `envconfig:"MINIO_PORT" default:"9000"`
	}
	Smtp struct {
		Host     string `envconfig:"SMTP_HOST" required:"true"`
		Port     int    `envconfig:"SMTP_PORT" default:"587"`
		Username string `envconfig:"SMTP_USERNAME" required:"true"`
		Password string `envconfig:"SMTP_PASSWORD" required:"true"`
	}
	Redis struct {
		Addr     string `envconfig:"REDISHOST" default:"redis"`
		Password string `envconfig:"REDISPASSWORD" required:"true"`
		Port     int    `envconfig:"REDISPORT" default:"6379"`
	}
	Verification struct {
		TTL time.Duration `envconfig:"VERIFICATION_TTL" default:"10m"`
	}
}

func MustLoad() Config {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		panic("cannot load config!!")
	}
	return cfg
}
