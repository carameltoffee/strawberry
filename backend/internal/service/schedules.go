package service

import (
	"context"
	"strawberry/internal/repository"
	"strawberry/pkg/logger"

	"go.uber.org/zap"
)

type SchedulesService struct {
	repo repository.Schedules
}

func newSchedulesService(r repository.Schedules) *SchedulesService {
	return &SchedulesService{repo: r}
}

func (s *SchedulesService) SetDayOff(ctx context.Context, userID int64, dayOfWeek string, isDayOff bool) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	err := s.repo.SetDayOff(ctx, userID, dayOfWeek, isDayOff)
	if err != nil {
		l.Error("failed to set day off", zap.Int64("userID", userID), zap.String("dayOfWeek", dayOfWeek), zap.Bool("isDayOff", isDayOff), zap.Error(err))
		return err
	}
	l.Info("day off updated", zap.Int64("userID", userID), zap.String("dayOfWeek", dayOfWeek), zap.Bool("isDayOff", isDayOff))
	return nil
}

func (s *SchedulesService) UpdateWorkingHours(ctx context.Context, userID int64, dayOfWeek, timeStart, timeEnd string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	err := s.repo.UpdateWorkingHours(ctx, userID, dayOfWeek, timeStart, timeEnd)
	if err != nil {
		l.Error("failed to update working hours", zap.Int64("userID", userID), zap.String("dayOfWeek", dayOfWeek),
			zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd), zap.Error(err))
		return err
	}
	l.Info("working hours updated", zap.Int64("userID", userID), zap.String("dayOfWeek", dayOfWeek),
		zap.String("timeStart", timeStart), zap.String("timeEnd", timeEnd))
	return nil
}
