package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"strawberry/internal/models"
	"strawberry/internal/repository"
	hasher "strawberry/pkg/hash"
	"strawberry/pkg/helper"
	"strawberry/pkg/jwt"
	"strawberry/pkg/logger"
	"strawberry/pkg/mail"

	"go.uber.org/zap"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInternal           = errors.New("internal server error")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserExists         = errors.New("user exists")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrCannotSend         = errors.New("can't send the email notification")
)

type ValidationError struct {
	Msg string
}

func (v ValidationError) Error() string {
	return v.Msg
}

type UsersService struct {
	r    *repository.Repository
	j    jwt.JwtManager
	h    *hasher.Hasher
	mail mail.MailClient
}

func newUsersService(r *repository.Repository, j jwt.JwtManager, h *hasher.Hasher, mail mail.MailClient) Users {
	return &UsersService{
		r:    r,
		j:    j,
		h:    h,
		mail: mail,
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

func (s *UsersService) Update(ctx context.Context, id int64, u *models.User) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	user, err := s.r.Users.GetById(ctx, u.Id)
	if err != nil {
		l.Warn("can't get user by id", zap.Error(err))
		return ErrNotFound
	}

	if id != 0 && user.Id != id {
		l.Warn("unauthorized", zap.Error(err))
		return ErrUnauthorized
	}

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
	return s.enrichWithRatings(ctx, users), nil
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

	avgRating, err := s.r.Reviews.AverageRatingOfMaster(ctx, user.Id)
	if err != nil {
		l.Error("can't get average rating", zap.Error(err))
		return nil, ErrInternal
	}
	user.AverageRating = avgRating

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

	avg, err := s.r.Reviews.AverageRatingOfMaster(ctx, user.Id)
	if err != nil {
		l.Error("failed to get rating", zap.Error(err))
		return nil, ErrInternal
	}
	user.AverageRating = avg

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
	return s.enrichWithRatings(ctx, users), nil
}

func (s *UsersService) GetMastersBySpecialization(ctx context.Context, spec string) ([]models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	users, err := s.r.Users.GetMastersBySpecialization(ctx, spec)
	if err != nil {
		l.Error("failed to get masters by specialization", zap.Error(err))
		return nil, ErrInternal
	}
	return s.enrichWithRatings(ctx, users), nil
}

func (s *UsersService) Login(ctx context.Context, identifier, pswrd string) (string, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	var user *models.User

	user, err := s.r.Users.GetByUsername(ctx, identifier)
	if err != nil {
		if errors.Is(err, repository.ErrNoUsers) {
			user, err = s.r.Users.GetByEmail(ctx, identifier)
			if err != nil {
				if errors.Is(err, repository.ErrNoUsers) {
					return "", ErrInvalidCredentials
				}
				l.Error("failed to fetch user by email for login", zap.Error(err))
				return "", ErrInternal
			}
		} else {
			l.Error("failed to fetch user by username for login", zap.Error(err))
			return "", ErrInternal
		}
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

	_ = helper.Retry(ctx, 5, time.Second, func() error {
		return s.mail.Send(user.Email, "Вы входили в аккаунт?", fmt.Sprintf("Вы входили в аккаунт в %s? Если это были не вы, немедленно смените пароль.", time.Now().Format("2006.01.02 в 15:04")))
	})

	return token, nil
}
func (s *UsersService) Search(ctx context.Context, query string) ([]models.User, error) {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	users, err := s.r.Users.SearchUsers(ctx, query)
	if err != nil {
		l.Error("can't search users for query", zap.Error(err))
		return nil, ErrInternal
	}
	return s.enrichWithRatings(ctx, users), nil
}

func (s *UsersService) ChangePassword(ctx context.Context, email string, new_pswrd string) error {
	ctx = logger.WithLogger(ctx)
	l := logger.FromContext(ctx)

	if err := models.ValidatePassword(new_pswrd); err != nil {
		return &ValidationError{Msg: err.Error()}
	}

	user, err := s.r.GetByEmail(ctx, email)
	if err != nil {
		l.Error("can't get user by email", zap.Error(err))
		if errors.Is(err, repository.ErrNoUsers) {
			return ErrNotFound
		}
		return ErrInternal
	}
	hashed := s.h.HashString(new_pswrd)
	if err := s.r.ChangePassword(ctx, user.Id, hashed); err != nil {
		l.Error("can't change pswrd", zap.Error(err))
		return ErrInternal
	}
	err = helper.Retry(ctx, 5, time.Second, func() error {
		return s.mail.Send(email, "Вы меняли ваш пароль?", "Похоже что вы изменили свой пароль, если вы этого не делали, смените свой пароль от почты и на сайте")
	})
	if err != nil {
		return ErrCannotSend
	}
	return nil
}

func (s *UsersService) enrichWithRatings(ctx context.Context, users []models.User) []models.User {
	for i := range users {
		r, err := s.r.Reviews.AverageRatingOfMaster(ctx, users[i].Id)
		if err == nil {
			users[i].AverageRating = r
		}
	}
	return users
}
