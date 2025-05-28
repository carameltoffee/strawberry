package mocks

import (
	"context"
	"time"

	"strawberry/internal/models"

	"github.com/stretchr/testify/mock"
)

type Appointments struct {
	mock.Mock
}

func (m *Appointments) Create(ctx context.Context, a *models.Appointment) (int64, error) {
	args := m.Called(ctx, a)
	return args.Get(0).(int64), args.Error(1)
}

func (m *Appointments) Delete(ctx context.Context, id int64, userId int64) error {
	args := m.Called(ctx, id, userId)
	return args.Error(0)
}

func (m *Appointments) GetByUserId(ctx context.Context, id int64) ([]models.Appointment, error) {
	args := m.Called(ctx, id)
	return args.Get(0).([]models.Appointment), args.Error(1)
}

func (m *Appointments) GetByMasterId(ctx context.Context, id int64) ([]models.Appointment, error) {
	args := m.Called(ctx, id)
	return args.Get(0).([]models.Appointment), args.Error(1)
}

func (m *Appointments) GetByDate(ctx context.Context, id int64, date time.Time) ([]models.Appointment, error) {
	args := m.Called(ctx, id, date)
	return args.Get(0).([]models.Appointment), args.Error(1)
}

func (m *Appointments) GetByStatus(ctx context.Context, status string) ([]models.Appointment, error) {
	args := m.Called(ctx, status)
	return args.Get(0).([]models.Appointment), args.Error(1)
}
