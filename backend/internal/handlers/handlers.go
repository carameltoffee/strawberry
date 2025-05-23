package handlers

import "github.com/gin-gonic/gin"

type Handler struct{}

func (h *Handler) InitRoutes() *gin.Engine {
	r := gin.Default()
	api := r.Group("api")
	{
		//registration and login user
		api.POST("/register")
		api.POST("/login")
		//get user's bookings
		api.GET("/bookings")

		//get masters/by id
		api.GET("/masters")
		api.GET("/masters/:id")

		//create,update,delete a booking
		api.POST("/bookings")
		api.PUT("/bookings/:id")
		api.DELETE("/bookings/:id")
	}
	return r
}
