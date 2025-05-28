package handlers

import (
	"strawberry/internal/service"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	s *service.Service
}

func New(s *service.Service) *Handler {
	return &Handler{
		s: s,
	}
}

func (h *Handler) InitRoutes() *gin.Engine {
	r := gin.Default()
	api := r.Group("api")
	{
		//registration and login user
		api.POST("/register", h.Register)
		api.POST("/login", h.Login)

		//get masters/by username
		api.GET("/masters", h.GetMasters)
		api.GET("/masters/:username", h.GetMasterByUsername)

		//create,get, delete an appointment
		api.GET("/appointments", h.GetAppointments)
		api.POST("/appointments", h.CreateAppointment)
		api.DELETE("/appointments/:id", h.DeleteAppointment)
	}
	return r
}
