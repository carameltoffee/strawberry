package service

import (
	"context"
	"errors"
	"fmt"
	"strawberry/internal/models"
	"strawberry/internal/repository"
	"strawberry/pkg/logger"
	"strings"
	"time"

	"go.uber.org/zap"
)

var (
	ErrBadDate        = errors.New("bad date")
	ErrNoWorkingSlots = errors.New("no working slots")
	DateFormat        = "2006-01-02"
)

type SchedulesService struct {
	repo *repository.Repository
}

func newSchedulesService(r *repository.Repository) *SchedulesService {
	return &SchedulesService{repo: r}
}

func (s *SchedulesService) SetDayOff(ctx context.Context, userId int64, dateStr string, isDayOff bool) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	date, err := time.Parse(DateFormat, dateStr)
	if err != nil {
		l.Error("invalid date format", zap.String("date", dateStr), zap.Error(err))
		return fmt.Errorf("invalid date format: %w", err)
	}

	err = s.repo.SetDayOff(ctx, userId, date, isDayOff)
	if err != nil {
		l.Error("failed to set date day off", zap.Int64("userID", userId), zap.String("date", dateStr), zap.Bool("isDayOff", isDayOff), zap.Error(err))
		return err
	}

	l.Info("date day off updated", zap.Int64("userID", userId), zap.String("date", dateStr), zap.Bool("isDayOff", isDayOff))
	return nil
}

func (s *SchedulesService) SetWorkingSlotsByWeekDay(ctx context.Context, userId int64, dayOfWeek string, slots []string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	validDays := map[string]struct{}{
		"monday": {}, "tuesday": {}, "wednesday": {}, "thursday": {},
		"friday": {}, "saturday": {}, "sunday": {},
	}
	if _, ok := validDays[dayOfWeek]; !ok {
		l.Error("validation failed")
		return ValidationError{Msg: "not valid week day"}
	}

	for _, slot := range slots {
		if _, err := time.Parse("15:04", slot); err != nil {
			err = fmt.Errorf("invalid time slot format: %s", slot)
			l.Error("validation failed", zap.String("slot", slot), zap.Error(err))
			return ValidationError{Msg: err.Error()}
		}
	}

	err := s.repo.SetWorkingSlotsByWeekDay(ctx, userId, dayOfWeek, slots)
	if err != nil {
		l.Error("failed to set working slots", zap.Int64("userID", userId), zap.String("dayOfWeek", dayOfWeek), zap.Any("slots", slots), zap.Error(err))
		return err
	}

	l.Info("working slots updated", zap.Int64("userID", userId), zap.String("dayOfWeek", dayOfWeek), zap.Any("slots", slots))
	return nil
}

func (s *SchedulesService) SetWorkingSlotsByDate(ctx context.Context, userId int64, date string, slots []string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	dateFormatted, err := time.Parse(DateFormat, date)
	if err != nil {
		l.Warn("invalid date format", zap.Error(err))
		return ErrBadDate
	}

	err = s.repo.Schedules.SetWorkingSlotsByDate(ctx, userId, dateFormatted, slots)
	if err != nil {
		l.Warn("can't set working slots", zap.Error(err))
		return ErrInternal
	}
	return nil
}

func (s *SchedulesService) DeleteWorkingSlotsByDate(ctx context.Context, userId int64, date string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	dateFormatted, err := time.Parse(DateFormat, date)
	if err != nil {
		return ErrBadDate
	}

	err = s.repo.Schedules.DeleteWorkingSlotsByDate(ctx, userId, dateFormatted)
	if err != nil {
		if errors.Is(err, repository.ErrNoWorkingSlots) {
			l.Warn("can't delete working slot", zap.Error(err))
			return ErrNoWorkingSlots
		}
		l.Error("can't delete working slot", zap.Error(err))
		return ErrInternal
	}
	return nil
}

func (s *SchedulesService) GetSchedule(ctx context.Context, date string, userId int64) (*models.TodaySchedule, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	day, err := time.Parse(DateFormat, date)
	if err != nil {
		return nil, ErrBadDate
	}
	dayOfWeek := strings.ToLower(day.Weekday().String())

	l.Info("Getting days off",
		zap.Int64("user_id", userId),
	)

	offDates, err := s.repo.GetDaysOff(ctx, userId)
	if err != nil {
		l.Error("Failed to get days off",
			zap.Int64("user_id", userId),
			zap.Error(err),
		)
		return nil, err
	}
	var daysOff []string
	for _, d := range offDates {
		daysOff = append(daysOff, d.Format(DateFormat))
	}

	l.Info("Getting slots by day",
		zap.Int64("user_id", userId),
		zap.String("day_of_week", dayOfWeek),
	)

	slots, err := s.repo.GetSlotsByDay(ctx, userId, day, dayOfWeek)
	if err != nil {
		l.Error("Failed to get slots by day",
			zap.Int64("user_id", userId),
			zap.String("day_of_week", dayOfWeek),
			zap.Error(err),
		)
		return nil, err
	}
	var slotStrs []string
	for _, slot := range slots {
		slotStrs = append(slotStrs, slot.Format("15:04"))
	}

	l.Info("Getting appointments by date",
		zap.Int64("user_id", userId),
		zap.String("date", day.Format(DateFormat)),
	)

	appointments, err := s.repo.Appointments.GetByDate(ctx, userId, day)
	if err != nil {
		l.Error("Failed to get appointments by date",
			zap.Int64("user_id", userId),
			zap.String("date", day.Format(DateFormat)),
			zap.Error(err),
		)
	}
	var appointmentStrs []string
	for _, a := range appointments {
		appointmentStrs = append(appointmentStrs, a.ScheduledAt.Format("15:04"))
	}

	l.Info("Successfully fetched today's schedule",
		zap.Int64("user_id", userId),
		zap.Strings("days_off", daysOff),
		zap.Strings("slots", slotStrs),
		zap.Strings("appointments", appointmentStrs),
	)

	return &models.TodaySchedule{
		DaysOff:      daysOff,
		Slots:        slotStrs,
		Appointments: appointmentStrs,
	}, nil
}
