package jwt

import (
	"testing"
	"time"
)

func TestGenerateAndVerify_ValidToken(t *testing.T) {
	secret := "test-secret"
	username := "testuser"
	id := 12
	manager := NewJwtManagerKeyTTL(secret, time.Minute)

	token, err := manager.Generate(username, int64(id))
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
	if claims.Id != int64(id) {
		t.Errorf("Expected id %q, got %q", id, claims.ID)
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
	token, err := manager.Generate("user", int64(37))
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	_, err = manager.Verify(token)
	if err == nil {
		t.Error("Expected error for expired token, got nil")
	}
}
