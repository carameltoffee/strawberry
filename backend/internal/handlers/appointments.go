package handlers

import (
	"errors"
	"net/http"
	"strawberry/internal/models"
	"strawberry/internal/service"
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

// @Summary Create a new appointment
// @Description Create a new appointment for the authenticated user
// @Tags appointments
// @Accept json
// @Produce json
// @Param input body AppointmentReq true "appointment info"
// @Success 201 {object} AppointmentRes
// @Failure 409 {object} ErrorResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Router /appointments [post]
func (h *Handler) CreateAppointment(c *gin.Context) {
	var data *AppointmentReq
	if err := c.ShouldBindJSON(&data); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid request", c)
		return
	}

	claims, exists := getClaims(c)
	if !exists {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	scheduledAt, err := time.Parse("2006-01-02 15:04", data.Time)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid time", c)
		return
	}

	id, err := h.s.Appointments.Create(c.Request.Context(), &models.Appointment{
		UserID:      claims.Id,
		MasterID:    data.MasterID,
		ScheduledAt: scheduledAt,
		Status:      "pending",
	})
	if err != nil {
		if errors.Is(err, service.ErrMasterUnavaliable) {
			newErrorResponse(http.StatusConflict, "master unavaliable", c)
			return
		}
		var valErr service.ValidationError
		if errors.As(err, &valErr) {
			newErrorResponse(http.StatusBadRequest, valErr.Msg, c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "could not create appointment", c)
		return
	}

	c.JSON(http.StatusCreated, &AppointmentRes{ID: id})
}

// @Summary Get appointments for the authenticated user
// @Description Get appointments filtered by date and/or status
// @Tags appointments
// @Accept json
// @Produce json
// @Param date query string false "Filter by date in format YYYY-MM-DD"
// @Param status query string false "Filter by status"
// @Success 200 {array} models.Appointment
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Router /appointments [get]
func (h *Handler) GetAppointments(c *gin.Context) {
	claims, exists := getClaims(c)
	if !exists {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}
	userId := claims.Id

	appointments, err := h.s.Appointments.GetByUserId(c.Request.Context(), userId)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "failed to get appointments", c)
		return
	}

	c.JSON(http.StatusOK, appointments)
}

// @Summary Delete an appointment
// @Description Delete an appointment by ID if it belongs to the user
// @Tags appointments
// @Accept json
// @Produce json
// @Param id path int true "Appointment ID"
// @Success 204 {string} string "No Content"
// @Failure 400 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Router /appointments/{id} [delete]
func (h *Handler) DeleteAppointment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid ID", c)
		return
	}

	claims, exists := getClaims(c)
	if !exists {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	err = h.s.Appointments.Delete(c.Request.Context(), id, claims.Id)
	if err != nil {
		if errors.Is(err, service.ErrAppointmentConflict) {
			newErrorResponse(http.StatusConflict, "appointment with this time already exists", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "could not delete appointment", c)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
