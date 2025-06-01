package repository

import (
	"context"
	"strawberry/internal/models"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	Users
	Appointments
	Schedules
}

type Schedules interface {
	SetDayOff(ctx context.Context, userID int64, date time.Time, isDayOff bool) error
	SetWorkingSlots(ctx context.Context, userID int64, dayOfWeek string, slots []string) error
	GetDaysOff(ctx context.Context, userId int64) ([]time.Time, error)
	GetSlotsByDay(ctx context.Context, userId int64, dayOfWeek string) ([]time.Time, error)
}

type Users interface {
	Create(ctx context.Context, us *models.User) (int64, error)
	Update(ctx context.Context, us *models.User) error
	Delete(ctx context.Context, id int64) error
	GetById(ctx context.Context, id int64) (*models.User, error)
	GetByFullName(ctx context.Context, fn string) ([]models.User, error)
	GetByUsername(ctx context.Context, un string) (*models.User, error)
	GetMastersByRating(ctx context.Context) ([]models.User, error)
	GetMastersBySpecialization(ctx context.Context, s string) ([]models.User, error)
}

type Appointments interface {
	Create(ctx context.Context, a *models.Appointment) (int64, error)
	Delete(ctx context.Context, id int64) error
	GetById(ctx context.Context, id int64) (*models.Appointment, error)
	GetByUserId(ctx context.Context, id int64) ([]models.Appointment, error)
	GetByMasterId(ctx context.Context, id int64) ([]models.Appointment, error)
	GetByDate(ctx context.Context, id int64, date time.Time) ([]models.Appointment, error)
	GetByStatus(ctx context.Context, status string) ([]models.Appointment, error)
}

func New(db *pgxpool.Pool) *Repository {
	return &Repository{
		Users:        newPostgresUsersRepository(db),
		Appointments: newPostgresAppointmentsRepository(db),
		Schedules:    newPostgresSchedulesRepository(db),
	}
}
