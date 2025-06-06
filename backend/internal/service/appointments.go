package service

import (
	"context"
	"encoding/json"
	"errors"
	"strawberry/internal/models"
	"strawberry/internal/repository"
	"strawberry/pkg/helper"
	"strawberry/pkg/logger"
	"strawberry/pkg/rabbitmq"
	"time"

	"github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type AppointmentsService struct {
	r   *repository.Repository
	rmq *rabbitmq.MQConnection
}

func newAppointmentsService(r *repository.Repository, rmq *rabbitmq.MQConnection) Appointments {
	return &AppointmentsService{
		r:   r,
		rmq: rmq,
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
		switch {
		case errors.Is(err, repository.ErrAppointmentConflict):
			l.Warn("appointment conflict", zap.Error(err))
			return 0, ErrAppointmentConflict
		case errors.Is(err, repository.ErrMasterUnavailable):
			return 0, ErrMasterUnavaliable
		default:
			l.Error("failed to create appointment", zap.Error(err))
			return 0, ErrInternal
		}
	}

	if err := s.publishAppointmentCreated(ctx, id, a); err != nil {
		l.Error("failed to publish appointment.created", zap.Error(err))
	}

	return id, nil
}

func (s *AppointmentsService) publishAppointmentCreated(ctx context.Context, id int64, a *models.Appointment) error {
	l := logger.FromContext(ctx)

	notification := struct {
		AppointmentId int64     `json:"appointment_id"`
		UserId        int64     `json:"user_id"`
		MasterId      int64     `json:"master_id"`
		Time          time.Time `json:"time"`
	}{
		AppointmentId: id,
		UserId:        a.UserID,
		MasterId:      a.MasterID,
		Time:          a.ScheduledAt,
	}

	return helper.Retry(ctx, 3, 100*time.Millisecond, func() error {
		body, err := json.Marshal(notification)
		if err != nil {
			l.Error("failed to marshal appointment.created payload", zap.Error(err))
			return err
		}
		if err := s.rmq.Channel.Publish(
			"appointments",
			"appointments.created",
			false,
			false,
			amqp091.Publishing{
				ContentType: "application/json",
				Body:        body,
			},
		); err != nil {
			l.Error("can't send message to rmq", zap.String("reason", err.Error()))
			return ErrInternal
		}
		l.Info("message sended to rabbitmq!!")
		return nil
	})
}

func (s *AppointmentsService) publishAppointmentDeleted(ctx context.Context, id int64, a *models.Appointment) error {
	l := logger.FromContext(ctx)

	notification := struct {
		AppointmentId int64     `json:"appointment_id"`
		UserId        int64     `json:"user_id"`
		MasterId      int64     `json:"master_id"`
		Time          time.Time `json:"time"`
	}{
		AppointmentId: id,
		UserId:        a.UserID,
		MasterId:      a.MasterID,
		Time:          a.ScheduledAt,
	}

	return helper.Retry(ctx, 3, 100*time.Millisecond, func() error {
		body, err := json.Marshal(notification)
		if err != nil {
			l.Error("failed to marshal appointment.deleted payload", zap.Error(err))
			return err
		}
		if err := s.rmq.Channel.Publish(
			"appointments",
			"appointments.deleted",
			false,
			false,
			amqp091.Publishing{
				ContentType: "application/json",
				Body:        body,
			},
		); err != nil {
			l.Error("can't send appointment.deleted message to rmq", zap.String("reason", err.Error()))
			return ErrInternal
		}
		l.Info("appointment.deleted message sent to rabbitmq")
		return nil
	})
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
		return ErrInternal
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

	if err := s.publishAppointmentDeleted(ctx, id, a); err != nil {
		l.Error("failed to publish appointment.deleted", zap.Error(err))
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

	var validAppointments []models.Appointment
	for _, appt := range appointments {
		if err := appt.Validate(); err != nil {
			l.Info("failed validating", zap.Error(err))
		} else {
			validAppointments = append(validAppointments, appt)
		}
	}
	return validAppointments, nil
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
