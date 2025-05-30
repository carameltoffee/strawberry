package handlers

import (
	"strawberry/internal/service"
	"strawberry/pkg/jwt"
	_ "strawberry/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/gin-gonic/gin"
)

const userCtxKey = "userId"

type Handler struct {
	s      *service.Service
	jwtMgr jwt.JwtManager
}

func New(s *service.Service, j jwt.JwtManager) *Handler {
	return &Handler{
		s:      s,
		jwtMgr: j,
	}
}

func (h *Handler) InitRoutes() *gin.Engine {
	r := gin.Default()
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	api := r.Group("api")
	{


		api.POST("/register", h.Register)
		api.POST("/login", h.Login)

		api.GET("/masters", h.GetMasters)
		api.GET("/masters/:username", h.GetMasterByUsername)

		auth := api.Group("/")
		auth.Use(h.authMiddleware())
		{
			auth.GET("/appointments", h.GetAppointments)
			auth.POST("/appointments", h.CreateAppointment)
			auth.DELETE("/appointments/:id", h.DeleteAppointment)
		}
	}
	return r
}
