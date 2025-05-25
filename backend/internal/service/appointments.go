package service

import "strawberry/internal/repository"

type AppointmentsService struct {
	r *repository.Repository
}

func newAppointmentsService(r *repository.Repository) Appointments {
	return &AppointmentsService{
		r: r,
	}
}
