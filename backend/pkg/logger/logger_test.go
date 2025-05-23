package logger

import (
    "context"
    "testing"

    "go.uber.org/zap"
)

func TestWithLoggerAndFromContext(t *testing.T) {
    ctx := context.Background()

    customLogger, err := zap.NewDevelopment()
    if err != nil {
        t.Fatalf("failed to create zap logger: %v", err)
    }
    defer customLogger.Sync()

    ctxWithLogger := WithLogger(ctx, customLogger)

    got := FromContext(ctxWithLogger)
    if got != customLogger {
        t.Error("FromContext did not return the logger stored in context")
    }
}

func TestFromContextReturnsDefaultIfMissing(t *testing.T) {
    ctx := context.Background()

    got := FromContext(ctx)
    if got == nil {
        t.Error("FromContext returned nil, expected default logger")
    }

    // Проверим, что дефолтный логгер не panic и работает
    sugar := got.Sugar()
    sugar.Infow("test log")
}

func TestSugarFromContext(t *testing.T) {
    ctx := context.Background()

    customLogger, err := zap.NewDevelopment()
    if err != nil {
        t.Fatalf("failed to create zap logger: %v", err)
    }
    defer customLogger.Sync()

    ctxWithLogger := WithLogger(ctx, customLogger)

    sugar := SugarFromContext(ctxWithLogger)
    if sugar == nil {
        t.Error("SugarFromContext returned nil")
    }

    sugar.Infow("test sugar log")
}
