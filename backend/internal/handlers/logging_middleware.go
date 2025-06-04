package handlers

import (
	"strawberry/pkg/logger"

	"github.com/gin-gonic/gin"
	u "github.com/google/uuid"
	"go.uber.org/zap"
)

func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		ctx = logger.WithLogger(ctx)
		l := logger.FromContext(ctx)
		uuid, _ := u.NewRandom()
		l.Info("request", zap.String("req_uuid", uuid.String()), zap.String("endpoint", c.Request.URL.Path))
		c.Next()
	}
}
