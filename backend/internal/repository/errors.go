package repository

import "errors"

var (
	ErrUserExists          = errors.New("user exists")
	ErrNoUsers             = errors.New("no users found")
	ErrNoAppointments      = errors.New("no appointments found")
	ErrAppointmentConflict = errors.New("appointment conflict")
	ErrMasterUnavailable = errors.New("master is not available at the selected time")
)
