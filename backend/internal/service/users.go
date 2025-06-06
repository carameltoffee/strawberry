package service

import (
	"context"
	"errors"

	"strawberry/internal/models"
	"strawberry/internal/repository"
	hasher "strawberry/pkg/hash"
	"strawberry/pkg/jwt"
	"strawberry/pkg/logger"

	"go.uber.org/zap"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInternal           = errors.New("internal server error")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserExists         = errors.New("user exists")
	ErrUnauthorized       = errors.New("unauthorized")
)

type ValidationError struct {
	Msg string
}

func (v ValidationError) Error() string {
	return v.Msg
}

type UsersService struct {
	r *repository.Repository
	j jwt.JwtManager
	h *hasher.Hasher
}

func newUsersService(r *repository.Repository, j jwt.JwtManager, h *hasher.Hasher) Users {
	return &UsersService{
		r: r,
		j: j,
		h: h,
	}
}

func (s *UsersService) Create(ctx context.Context, u *models.User) (int64, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	if err := u.Validate(); err != nil {
		l.Warn("invalid user data", zap.Error(err))
		return 0, ValidationError{
			Msg: err.Error(),
		}
	}

	u.Password = s.h.HashString(u.Password)

	id, err := s.r.Users.Create(ctx, u)
	if err != nil {
		if errors.Is(err, repository.ErrUserExists) {
			l.Warn("user already exists", zap.Error(err))
			return 0, ErrUserExists
		}
		l.Error("failed to create user", zap.Error(err))
		return 0, ErrInternal
	}
	return id, nil
}

func (s *UsersService) Update(ctx context.Context, u *models.User) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	if err := u.Validate(); err != nil {
		l.Warn("invalid user data", zap.Error(err))
		return ValidationError{
			Msg: err.Error(),
		}
	}

	if err := s.r.Users.Update(ctx, u); err != nil {
		l.Error("failed to update user", zap.Error(err))
		return ErrInternal
	}
	return nil
}

func (s *UsersService) Delete(ctx context.Context, id int64) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	if err := s.r.Users.Delete(ctx, id); err != nil {
		if errors.Is(err, repository.ErrNoUsers) {
			l.Warn("user not found", zap.Int64("id", id))
			return ErrUserNotFound
		}
		l.Error("failed to delete user", zap.Error(err))
		return ErrInternal
	}
	return nil
}

func (s *UsersService) GetByFullName(ctx context.Context, fn string) ([]models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	users, err := s.r.Users.GetByFullName(ctx, fn)
	if err != nil {
		l.Error("failed to get users by full name", zap.Error(err))
		return nil, ErrInternal
	}
	return users, nil
}

func (s *UsersService) GetById(ctx context.Context, id int64) (*models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	user, err := s.r.Users.GetById(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNoUsers) {
			return nil, ErrUserNotFound
		}
		l.Error("can't get user", zap.Error(err))
		return nil, ErrInternal
	}
	return user, nil
}

func (s *UsersService) GetByUsername(ctx context.Context, un string) (*models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	user, err := s.r.Users.GetByUsername(ctx, un)
	if err != nil {
		if errors.Is(err, repository.ErrNoUsers) {
			l.Warn("user not found", zap.String("username", un))
			return nil, ErrUserNotFound
		}
		l.Error("failed to get user by username", zap.Error(err))
		return nil, ErrInternal
	}
	return user, nil
}

func (s *UsersService) GetMastersByRating(ctx context.Context) ([]models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	users, err := s.r.Users.GetMastersByRating(ctx)
	if err != nil {
		l.Error("failed to get masters by rating", zap.Error(err))
		return nil, ErrInternal
	}
	return users, nil
}

func (s *UsersService) GetMastersBySpecialization(ctx context.Context, spec string) ([]models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	users, err := s.r.Users.GetMastersBySpecialization(ctx, spec)
	if err != nil {
		l.Error("failed to get masters by specialization", zap.Error(err))
		return nil, ErrInternal
	}
	return users, nil
}

func (s *UsersService) Login(ctx context.Context, identifier, pswrd string) (string, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	user, err := s.r.Users.GetByUsername(ctx, identifier)
	if err != nil {
		if errors.Is(err, repository.ErrNoUsers) {
			l.Warn("login failed - user not found", zap.String("identifier", identifier))
			return "", ErrInvalidCredentials
		}
		l.Error("failed to fetch user for login", zap.Error(err))
		return "", ErrInternal
	}

	expected := s.h.HashString(pswrd)
	if user.Password != expected {
		l.Warn("login failed - password mismatch", zap.String("username", user.Username))
		return "", ErrInvalidCredentials
	}

	token, err := s.j.Generate(user.Username, user.Id)
	if err != nil {
		l.Error("failed to generate JWT", zap.Error(err))
		return "", ErrInternal
	}

	return token, nil
}
