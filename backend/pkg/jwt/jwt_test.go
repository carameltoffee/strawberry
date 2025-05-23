package jwt

import (
	"testing"
	"time"
)

func TestGenerateAndVerify_ValidToken(t *testing.T) {
	secret := "test-secret"
	username := "testuser"
	manager := NewJwtManagerKeyTTL(secret, time.Minute)

	token, err := manager.Generate(username)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	claims, err := manager.Verify(token)
	if err != nil {
		t.Fatalf("Failed to verify token: %v", err)
	}

	if claims.Username != username {
		t.Errorf("Expected username %q, got %q", username, claims.Username)
	}
}

func TestVerify_InvalidToken(t *testing.T) {
	manager := NewJwtManagerKeyTTL("some-secret", time.Minute)
	invalidToken := "this.is.not.a.valid.token"

	_, err := manager.Verify(invalidToken)
	if err == nil {
		t.Error("Expected error when verifying invalid token, got nil")
	}
}

func TestVerify_ExpiredToken(t *testing.T) {
	manager := NewJwtManagerKeyTTL("secret", -1*time.Second)
	token, err := manager.Generate("user")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	_, err = manager.Verify(token)
	if err == nil {
		t.Error("Expected error for expired token, got nil")
	}
}
