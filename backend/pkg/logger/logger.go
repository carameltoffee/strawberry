package logger

import (
	"context"

	"go.uber.org/zap"
)

type ctxKey struct{}

var defaultLogger *zap.Logger

func init() {
	var err error
	defaultLogger, err = zap.NewProduction()
	if err != nil {
		panic("failed to create default zap logger: " + err.Error())
	}
}

func WithLogger(ctx context.Context) context.Context {
	return context.WithValue(ctx, ctxKey{}, defaultLogger)
}

func FromContext(ctx context.Context) *zap.Logger {
	logger, ok := ctx.Value(ctxKey{}).(*zap.Logger)
	if !ok || logger == nil {
		return defaultLogger
	}
	return logger
}

func SugarFromContext(ctx context.Context) *zap.SugaredLogger {
	return FromContext(ctx).Sugar()
}
