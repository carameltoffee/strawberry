package repository

import (
	"context"
	"strawberry/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	Users
	Appointments
}

type Users interface {
	Create(ctx context.Context, us *models.User) (int64, error)
	Update(ctx context.Context, us *models.User) (error)
	Delete(ctx context.Context, id int64) (error)
	GetByUsername(ctx context.Context, un string) (*models.User, error)
	GetMastersByRating(ctx context.Context) ([]models.User, error)
	GetMastersBySpecialization(ctx context.Context, s string) ([]models.User,error) 
}

type Appointments interface {
}

func New(db *pgxpool.Pool) *Repository {
	return &Repository{
		Users:        newPostgresUsersRepository(db),
		Appointments: newPostgresAppointmentsRepository(db),
	}
}
