package service

import (
	"context"
	"strawberry/internal/models"
	"strawberry/internal/repository"
	hasher "strawberry/pkg/hash"
	"strawberry/pkg/jwt"
	"time"
)

type Service struct {
	Users
	Appointments
}

type Users interface {
	Create(ctx context.Context, us *models.User) (int64, error)
	Update(ctx context.Context, us *models.User) error
	Delete(ctx context.Context, id int64) error
	GetByFullName(ctx context.Context, fn string) ([]models.User, error)
	GetByUsername(ctx context.Context, un string) (*models.User, error)
	GetMastersByRating(ctx context.Context) ([]models.User, error)
	GetMastersBySpecialization(ctx context.Context, s string) ([]models.User, error)
	Login(ctx context.Context, identifier string, pswrd string) (string, error)
}

type Appointments interface {
	Create(ctx context.Context, a *models.Appointment) (int64, error)
	Delete(ctx context.Context, id int64, userId int64) error
	GetByUserId(ctx context.Context, id int64) ([]models.Appointment, error)
	GetByMasterId(ctx context.Context, id int64) ([]models.Appointment, error)
	GetByDate(ctx context.Context, id int64, date time.Time) ([]models.Appointment, error)
	GetByStatus(ctx context.Context, status string) ([]models.Appointment, error)
}

type Deps struct {
	r      *repository.Repository
	jwtMgr jwt.JwtManager
	hasher *hasher.Hasher
}

func New(d *Deps) *Service {
	return &Service{
		Users:        newUsersService(d.r, d.jwtMgr, d.hasher),
		Appointments: newAppointmentsService(d.r),
	}
}
