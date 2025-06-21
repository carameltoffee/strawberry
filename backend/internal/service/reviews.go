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

type ReviewsService struct {
	repo *repository.Repository
	rmq  *rabbitmq.MQConnection
}

var (
	ErrNotFound           = errors.New("resource not found")
	ErrConflict           = errors.New("resource already exists")
	ErrInvalidReference   = errors.New("invalid foreign key reference")
	ErrNoPastAppointments = errors.New("no past appointments with this master")
)

func newReviewsService(r *repository.Repository, rmq *rabbitmq.MQConnection) *ReviewsService {
	return &ReviewsService{
		repo: r,
		rmq:  rmq,
	}
}

func (s *ReviewsService) publishReviewCreated(ctx context.Context, r *models.Review) error {
	l := logger.FromContext(ctx)

	notification := struct {
		UserId   int64     `json:"user_id"`
		MasterId int64     `json:"master_id"`
		Rating   int       `json:"rating"`
		Msg      string    `json:"message"`
		Time     time.Time `json:"created_at"`
	}{
		UserId:   r.UserId,
		MasterId: r.MasterId,
		Msg:      r.Comment,
		Rating:   r.Rating,
		Time:     r.CreatedAt,
	}

	return helper.Retry(ctx, 3, 100*time.Millisecond, func() error {
		body, err := json.Marshal(notification)
		if err != nil {
			l.Error("failed to marshal reviews.created payload", zap.Error(err))
			return err
		}
		if err := s.rmq.Channel.Publish(
			"reviews",
			"reviews.created",
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

func (s *ReviewsService) Create(ctx context.Context, r *models.Review) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	l.Info("start creating review", zap.Int64("user_id", r.UserId), zap.Int64("master_id", r.MasterId))

	appointments, err := s.repo.Appointments.GetByUserId(ctx, r.UserId)
	if err != nil {
		l.Error("cannot get appointment", zap.Error(err))
		return err
	}

	hasPastAppointment := false
	now := time.Now()
	for _, appointment := range appointments {
		if appointment.ScheduledAt.Before(now) {
			hasPastAppointment = true
			break
		}
	}

	if !hasPastAppointment {
		l.Warn("user has no past appointments, cannot leave review", zap.Int64("user_id", r.UserId))
		return ErrNoPastAppointments
	}

	err = s.repo.Reviews.Create(ctx, r)
	if err != nil {
		l.Error("cannot create review", zap.Error(err))
		if errors.Is(err, repository.ErrConflict) {
			return ErrConflict
		}
		return err
	}

	go func(r *models.Review) {
		bgCtx := context.Background()
		bgCtx = logger.WithLogger(bgCtx)
		bgLog := logger.FromContext(bgCtx)

		if err := s.publishReviewCreated(bgCtx, r); err != nil {
			bgLog.Error("cannot publish review to rmq (async)", zap.Error(err))
		}
	}(r)

	l.Info("review created", zap.Int64("review_id", r.Id))

	return nil
}

func (s *ReviewsService) GetById(ctx context.Context, id int64) (*models.Review, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	rev, err := s.repo.Reviews.GetById(ctx, id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			l.Info("review not found", zap.Int64("review_id", id))
			return nil, ErrNotFound
		}
		l.Error("failed to get review", zap.Error(err))
		return nil, err
	}
	return rev, nil
}

func (s *ReviewsService) GetByMasterId(ctx context.Context, masterId int64) ([]models.Review, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	reviews, err := s.repo.Reviews.GetByMasterId(ctx, masterId)
	if err != nil {
		l.Error("failed to get reviews by master id", zap.Error(err))
		return nil, err
	}
	return reviews, nil
}

func (s *ReviewsService) Update(ctx context.Context, r *models.Review) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	rBase, err := s.repo.Reviews.GetById(ctx, r.Id)
	if err != nil {
		l.Error("failed to get review", zap.Error(err))
		return err
	}
	if r.UserId != rBase.UserId {
		l.Warn("unauthorized")
		return ErrUnauthorized
	}

	err = s.repo.Reviews.Update(ctx, r)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			l.Info("review not found for update", zap.Int64("review_id", r.Id))
			return ErrNotFound
		}
		l.Error("failed to update review", zap.Error(err))
		return err
	}
	l.Info("review updated", zap.Int64("review_id", r.Id))
	return nil
}

func (s *ReviewsService) Delete(ctx context.Context, userId int64, id int64) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	r, err := s.repo.Reviews.GetById(ctx, id)
	if err != nil {
		l.Error("failed to get review", zap.Error(err))
		return err
	}

	if r.UserId != userId {
		return ErrUnauthorized
	}

	err = s.repo.Reviews.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			l.Info("review not found for delete", zap.Int64("review_id", id))
			return ErrNotFound
		}
		l.Error("failed to delete review", zap.Error(err))
		return err
	}
	l.Info("review deleted", zap.Int64("review_id", id))
	return nil
}
