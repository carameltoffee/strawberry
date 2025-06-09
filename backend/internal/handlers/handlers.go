package handlers

import (
	_ "strawberry/docs"
	"strawberry/internal/service"
	"strawberry/pkg/jwt"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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
	r := gin.New()
	r.Use(LoggingMiddleware(), CORSMiddleware(), gin.Recovery())
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	api := r.Group("api")
	{

		api.POST("/send-code", h.SendVerificationCode)

		api.POST("/register", h.Register)
		api.POST("/login", h.Login)

		api.GET("/masters", h.GetMasters)
		api.GET("/masters/:username", h.GetMasterByUsername)
		api.GET("/users/:id", h.GetMasterById)

		api.GET("/users/:id/works", h.GetMasterWorks)
		api.GET("/users/:id/works/:workId", h.GetMasterWork)

		api.GET("/users/:id/avatar", h.GetAvatar)
		api.GET("/reviews/master/:master_id", h.GetReviewsByMasterId)

		api.GET("schedule/:id", h.GetSchedule)
		auth := api.Group("/")
		auth.Use(h.authMiddleware())
		{
			reviews := auth.Group("/reviews")
			{
				reviews.POST("/", h.CreateReview)
				reviews.PUT("/:id", h.UpdateReview)
				reviews.DELETE("/:id", h.DeleteReview)
			}
			auth.GET("/masters/appointments", h.GetMasterAppointments)
			auth.POST("users/works", h.UploadMasterWork)
			auth.POST("/users/avatar", h.UploadAvatar)
			auth.DELETE("masters/works/:id", h.DeleteMasterWork)
			// auth.DELETE("/users/avatar", h.DeleteAvatar)
			auth.GET("/appointments", h.GetAppointments)
			auth.POST("/appointments", h.CreateAppointment)
			auth.DELETE("/appointments/:id", h.DeleteAppointment)

			auth.PUT("/schedule/dayoff", h.SetDayOff)

			auth.PUT("/schedule/hours/weekday", h.SetWorkingSlotsByWeekDay)

			auth.PUT("/schedule/hours/date", h.SetWorkingSlotsByDate)
			auth.DELETE("/schedule/hours/date", h.DeleteWorkingSlotsByDate)
		}
	}
	return r
}
