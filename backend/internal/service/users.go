package service

import "strawberry/internal/repository"

type UsersService struct {
	r *repository.Repository
}

func newUsersService(r *repository.Repository) Users {
	return &UsersService{
		r: r,
	}
}


