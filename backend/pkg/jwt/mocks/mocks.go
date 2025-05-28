package mocks

import (
	"strawberry/pkg/jwt"

	"github.com/stretchr/testify/mock"
)

type JwtManager struct {
	mock.Mock
}

func (m *JwtManager) Generate(username string, id int64) (string, error) {
	args := m.Called(username, id)
	return args.String(0), args.Error(1)
}

func (m *JwtManager) Verify(token string) (*jwt.CustomClaims, error) {
	args := m.Called(token)
	claims, _ := args.Get(0).(*jwt.CustomClaims)
	return claims, args.Error(1)
}
