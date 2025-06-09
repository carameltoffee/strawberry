package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"strawberry/internal/repository"
	"strawberry/pkg/helper"
	"strawberry/pkg/mail"
	"time"
)

type VerificationCodeService struct {
	repo *repository.Repository
	mail mail.MailClient
	ttl  time.Duration
}

var (
	ErrInvalidCode    = errors.New("invalid code provided")
	ErrCannotSendCode = errors.New("cannot send code")
)

func newVerificationCodeService(repo *repository.Repository, mail mail.MailClient, ttl time.Duration) VerificationCode {
	return &VerificationCodeService{
		repo: repo,
		mail: mail,
		ttl:  ttl,
	}
}

func (s *VerificationCodeService) SendCode(ctx context.Context, email string) (string, error) {
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	err := s.repo.VerificationCode.SetCode(ctx, email, code, s.ttl)
	if err != nil {
		return "", err
	}
	err = helper.Retry(ctx, 5, time.Second, func() error {
		return s.mail.Send(email, "Ваш код для регистрации", fmt.Sprintf("Ваш код: %s", code))
	})
	if err != nil {
		return "", ErrCannotSendCode
	}
	return code, nil
}

func (s *VerificationCodeService) VerifyCode(ctx context.Context, email, inputCode string) error {
	stored, err := s.repo.VerificationCode.GetCode(ctx, email)
	if err != nil {
		return err
	}
	if stored != inputCode {
		return ErrInvalidCode
	}
	return s.repo.DeleteCode(ctx, email)
}
