package handlers

import (
	"net/http"
	"strawberry/internal/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type AppointmentReq struct {
	MasterID int64  `json:"master_id"`
	Time     string `json:"time"`
}

type AppointmentRes struct {
	ID int64 `json:"id"`
}

func (h *Handler) CreateAppointment(c *gin.Context) {
	var data *AppointmentReq
	if err := c.ShouldBindJSON(&data); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid request", c)
		return
	}

	userId, exists := c.Get(userCtxKey)
	if !exists {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	scheduledAt, err := time.Parse("2006-01-02", data.Time)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid time", c)
		return
	}

	id, err := h.s.Appointments.Create(c.Request.Context(), &models.Appointment{
		UserID:      userId.(int64),
		MasterID:    data.MasterID,
		ScheduledAt: scheduledAt,
		Status:      "pending",
	})
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "could not create appointment", c)
		return
	}

	c.JSON(http.StatusCreated, &AppointmentRes{ID: id})
}

func (h *Handler) GetAppointments(c *gin.Context) {
	userIdVal, exists := c.Get(userCtxKey)
	if !exists {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}
	userId := userIdVal.(int64)

	dateStr := c.Query("date")
	status := c.Query("status")

	var appointments []models.Appointment
	var err error

	switch {
	case dateStr != "" && status != "":
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			newErrorResponse(http.StatusBadRequest, "invalid date format", c)
			return
		}
		appointments, err = h.s.Appointments.GetByDate(c.Request.Context(), userId, date)
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get appointments by date", c)
			return
		}
		filtered := []models.Appointment{}
		for _, a := range appointments {
			if a.Status == status {
				filtered = append(filtered, a)
			}
		}
		appointments = filtered

	case dateStr != "":
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			newErrorResponse(http.StatusBadRequest, "invalid date format", c)
			return
		}
		appointments, err = h.s.Appointments.GetByDate(c.Request.Context(), userId, date)
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get appointments by date", c)
			return
		}

	case status != "":
		appointments, err = h.s.Appointments.GetByStatus(c.Request.Context(), status)
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get appointments by status", c)
			return
		}
		filtered := []models.Appointment{}
		for _, a := range appointments {
			if a.UserID == userId {
				filtered = append(filtered, a)
			}
		}
		appointments = filtered

	default:
		appointments, err = h.s.Appointments.GetByUserId(c.Request.Context(), userId)
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get appointments", c)
			return
		}
	}

	c.JSON(http.StatusOK, appointments)
}

func (h *Handler) DeleteAppointment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid ID", c)
		return
	}

	userId, exists := c.Get(userCtxKey)
	if !exists {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	err = h.s.Appointments.Delete(c.Request.Context(), id, userId.(int64))
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "could not delete appointment", c)
		return
	}

	c.Status(http.StatusOK)
}
