package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrUnexpectedMethod = errors.New("unexpected signing method")
	ErrInvalidToken     = errors.New("invalid token")
)

type JwtManager interface {
	Generate(username string) (string, error)
	Verify(token string) (*jwt.MapClaims, error)
}

type JwtManagerKeyTTL struct {
	secretKey string
	TTL       time.Duration
}

type CustomClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func NewJwtManagerKeyTTL(secretKey string, ttl time.Duration) *JwtManagerKeyTTL {
	return &JwtManagerKeyTTL{
		secretKey: secretKey,
		TTL:       ttl,
	}
}

func (m *JwtManagerKeyTTL) Generate(username string) (string, error) {
	claims := CustomClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.TTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secretKey))
}

func (m *JwtManagerKeyTTL) Verify(token string) (*CustomClaims, error) {
	tokenVal, err := jwt.ParseWithClaims(token, &CustomClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrUnexpectedMethod
		}
		return []byte(m.secretKey), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := tokenVal.Claims.(*CustomClaims)
	if !ok || !tokenVal.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}
