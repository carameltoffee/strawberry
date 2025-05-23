package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JwtManager interface {
}

type JwtManagerKeyTTL struct {
	secretKey string
	TTL       time.Duration
	claims    jwt.Claims
}

func NewJwtManagerKeyTTL(secretKey string, ttl time.Duration, claims jwt.Claims) *JwtManagerKeyTTL {
	return &JwtManagerKeyTTL{
		secretKey: secretKey,
		TTL:       ttl,
		claims:    claims,
	}
}
