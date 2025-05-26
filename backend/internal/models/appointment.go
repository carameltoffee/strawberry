package models

import (
	"errors"
	"time"
)

var validStatuses = map[string]bool{
	"pending":   true,
	"confirmed": true,
	"canceled":  true,
	"completed": true,
}

type Appointment struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	MasterID    int       `json:"master_id"`
	ScheduledAt time.Time `json:"scheduled_at"`
	CreatedAt   time.Time `json:"created_at"`
	Status      string    `json:"status"`
}

func (a *Appointment) Validate() error {
	if a.UserID <= 0 {
		return errors.New("user_id must be positive")
	}
	if a.MasterID <= 0 {
		return errors.New("master_id must be positive")
	}

	if a.UserID == a.MasterID {
		return errors.New("user cannot book an appointment with themselves")
	}

	if a.ScheduledAt.Before(time.Now().Add(1 * time.Minute)) {
		return errors.New("scheduled_at must be in the future")
	}

	if !validStatuses[a.Status] {
		return errors.New("invalid status value")
	}

	return nil
}
