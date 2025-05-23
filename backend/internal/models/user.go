package models

import (
	"errors"
	"strings"
	"time"
	"unicode"
)

type User struct {
	ID             int    `json:"id"`
	FullName       string `json:"full_name"`
	Username       string `json:"username"`
	Password       string
	RegisteredAt   time.Time `json:"registered_at"`
	AverageRating  float32   `json:"average_rating"`
	Specialization string    `json:"specialization"`
}

func ValidateUser(u *User) error {
	if len(strings.TrimSpace(u.FullName)) < 2 || len(u.FullName) > 255 {
		return errors.New("full name must be between 2 and 255 characters")
	}

	if len(u.Username) < 3 || len(u.Username) > 100 {
		return errors.New("username must be between 3 and 100 characters")
	}
	for _, r := range u.Username {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) {
			return errors.New("username must contain only letters and digits")
		}
	}

	if len(u.Password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	var hasLetter, hasDigit bool
	for _, r := range u.Password {
		switch {
		case unicode.IsLetter(r):
			hasLetter = true
		case unicode.IsDigit(r):
			hasDigit = true
		}
	}
	if !hasLetter || !hasDigit {
		return errors.New("password must contain at least one letter and one digit")
	}

	if u.AverageRating < 0 || u.AverageRating > 5 {
		return errors.New("average rating must be between 0 and 5")
	}

	if u.Specialization != "" {
		for _, r := range u.Specialization {
			if !unicode.IsLetter(r) {
				return errors.New("specialization must contain only letters")
			}
		}
	}

	return nil
}
