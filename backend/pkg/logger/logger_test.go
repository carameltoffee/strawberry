package logger

import (
	"context"
	"testing"
)

func TestWithLoggerAndFromContext(t *testing.T) {
	ctx := context.Background()

	ctxWithLogger := WithLogger(ctx)

	got := FromContext(ctxWithLogger)
	if got == nil {
		t.Error("FromContext did not return the logger stored in context")
	}
}

func TestFromContextReturnsDefaultIfMissing(t *testing.T) {
	ctx := context.Background()

	got := FromContext(ctx)
	if got == nil {
		t.Error("FromContext returned nil, expected default logger")
	}

	sugar := got.Sugar()
	sugar.Infow("test log")
}

func TestSugarFromContext(t *testing.T) {
	ctx := context.Background()
	ctxWithLogger := WithLogger(ctx)

	sugar := SugarFromContext(ctxWithLogger)
	if sugar == nil {
		t.Error("SugarFromContext returned nil")
	}

	sugar.Infow("test sugar log")
}
