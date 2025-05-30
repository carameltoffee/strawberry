package service

import (
	"context"
	"errors"
	"strawberry/internal/models"
	"strawberry/internal/repository"
	"strawberry/pkg/logger"
	"time"

	"go.uber.org/zap"
)

type AppointmentsService struct {
	r *repository.Repository
}

func newAppointmentsService(r *repository.Repository) Appointments {
	return &AppointmentsService{
		r: r,
	}
}

var (
	ErrAppointmentNotFound = errors.New("appointment not found")
	ErrAppointmentConflict = errors.New("appointment conflict")
	ErrInvalidAppointment  = errors.New("invalid appointment data")
	ErrMasterUnavaliable   = errors.New("master unavaliable")
)

func (s *AppointmentsService) Create(ctx context.Context, a *models.Appointment) (int64, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	if err := a.Validate(); err != nil {
		l.Warn("invalid appointment data", zap.Error(err))
		return 0, ValidationError{Msg: err.Error()}
	}

	id, err := s.r.Appointments.Create(ctx, a)
	if err != nil {
		if errors.Is(err, repository.ErrAppointmentConflict) {
			l.Warn("appointment conflict", zap.Error(err))
			return 0, ErrAppointmentConflict
		}
		if errors.Is(err, repository.ErrMasterUnavailable) {
			return 0, ErrMasterUnavaliable
		}
		l.Error("failed to create appointment", zap.Error(err))
		return 0, ErrInternal
	}
	return id, nil
}

func (s *AppointmentsService) Delete(ctx context.Context, id int64, userId int64) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	a, err := s.r.Appointments.GetById(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNoAppointments) {
			l.Warn("appointment not found", zap.Int64("id", id))
			return ErrAppointmentNotFound
		}
		l.Error("failed to get appointment", zap.Error(err))
	}

	if a.UserID != userId {
		l.Warn("unauthorized", zap.Int64("user_id", userId))
		return ErrUnauthorized
	}

	err = s.r.Appointments.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNoAppointments) {
			l.Warn("appointment not found", zap.Int64("id", id))
			return ErrAppointmentNotFound
		}
		l.Error("failed to delete appointment", zap.Error(err))
		return ErrInternal
	}
	return nil
}

func (s *AppointmentsService) GetByUserId(ctx context.Context, id int64) ([]models.Appointment, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	appointments, err := s.r.Appointments.GetByUserId(ctx, id)
	if err != nil {
		l.Error("failed to get appointments by user ID", zap.Error(err))
		return nil, ErrInternal
	}
	return appointments, nil
}

func (s *AppointmentsService) GetByMasterId(ctx context.Context, id int64) ([]models.Appointment, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	appointments, err := s.r.Appointments.GetByMasterId(ctx, id)
	if err != nil {
		l.Error("failed to get appointments by master ID", zap.Error(err))
		return nil, ErrInternal
	}
	return appointments, nil
}

func (s *AppointmentsService) GetByDate(ctx context.Context, id int64, date time.Time) ([]models.Appointment, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	appointments, err := s.r.Appointments.GetByDate(ctx, id, date)
	if err != nil {
		l.Error("failed to get appointments by date", zap.Time("date", date), zap.Error(err))
		return nil, ErrInternal
	}
	return appointments, nil
}

func (s *AppointmentsService) GetByStatus(ctx context.Context, status string) ([]models.Appointment, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	appointments, err := s.r.Appointments.GetByStatus(ctx, status)
	if err != nil {
		l.Error("failed to get appointments by status", zap.String("status", status), zap.Error(err))
		return nil, ErrInternal
	}
	return appointments, nil
}
