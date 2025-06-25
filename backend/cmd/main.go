package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strawberry/internal/config"
	"strawberry/internal/handlers"
	"strawberry/internal/repository"
	"strawberry/internal/service"
	hasher "strawberry/pkg/hash"
	"strawberry/pkg/jwt"
	"strawberry/pkg/logger"
	"strawberry/pkg/mail"
	minio_client "strawberry/pkg/minio"
	db "strawberry/pkg/postgres"
	"strawberry/pkg/rabbitmq"
	"strawberry/pkg/redis"
	"syscall"
	"time"

	"go.uber.org/zap"
)

// @title Strawberry API
// @version 1.0
// @description Appointment booking system
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	ctx := logger.WithLogger(context.Background())
	log := logger.FromContext(ctx)

	cfg := config.MustLoad()

	pool, err := db.NewPGXPool(ctx, db.Config{
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		Name:     cfg.Database.Name,
		SSLMode:  cfg.Database.SSLMode,
	})
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	jwtMgr := jwt.NewJwtManagerKeyTTL(cfg.Jwt.SecretKey, cfg.Jwt.TTL)
	redis, err := redis.New(fmt.Sprintf("%s:%d", cfg.Redis.Addr, cfg.Redis.Port), cfg.Redis.Password, 0)
	if err != nil {
		panic(err)
	}

	repo := repository.New(pool, redis)
	minio, err := minio_client.New(fmt.Sprintf("minio:%d", cfg.Minio.Port), cfg.Minio.AccessKey,
		cfg.Minio.SecretKey, cfg.Minio.SslMode)
	if err != nil {
		log.Error("minio doesn't work")
	}
	rmq, err := rabbitmq.ConnectRabbitMQ(cfg.RabbitMq.Uri)
	if err != nil {
		panic(err)
	}
	defer rmq.Close()
	svc := service.New(&service.Deps{
		Repository: repo,
		JwtMgr:     jwtMgr,
		Hasher:     hasher.New(),
		RabbitMq:   rmq,
		Minio:      minio,
		MailClient: mail.New(cfg.Smtp.Host, cfg.Smtp.Port, cfg.Smtp.Username, cfg.Smtp.Password, cfg.Smtp.Username),
	})

	h := handlers.New(svc, jwtMgr)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.App.Port),
		Handler: h.InitRoutes(),
	}

	go func() {
		log.Info("starting server", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	<-stop
	log.Info("shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server forced to shutdown", zap.Error(err))
	} else {
		log.Info("server gracefully stopped")
	}
}
