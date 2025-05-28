package mocks

import (
	"context"
	"strawberry/internal/models"

	"github.com/stretchr/testify/mock"
)

type Users struct {
	mock.Mock
}

func (m *Users) Create(ctx context.Context, user *models.User) (int64, error) {
	args := m.Called(ctx, user)
	return args.Get(0).(int64), args.Error(1)
}

func (m *Users) Login(ctx context.Context, username, password string) (string, error) {
	args := m.Called(ctx, username, password)
	return args.String(0), args.Error(1)
}

func (m *Users) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *Users) GetMastersBySpecialization(ctx context.Context, spec string) ([]models.User, error) {
	args := m.Called(ctx, spec)
	return args.Get(0).([]models.User), args.Error(1)
}

func (m *Users) GetMastersByRating(ctx context.Context) ([]models.User, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.User), args.Error(1)
}
