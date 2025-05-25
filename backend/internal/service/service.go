package service

import "strawberry/internal/repository"

type Service struct {
	Users
	Appointments
}

type Users interface{}

type Appointments interface{}

type Deps struct {
	r *repository.Repository
}

func New(d *Deps) *Service {
	return &Service{
		Users:        newUsersService(d.r),
		Appointments: newAppointmentsService(d.r),
	}
}
