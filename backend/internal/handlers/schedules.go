package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type setDayOffInput struct {
	DayOfWeek string `json:"day_of_week" binding:"required"`
	IsDayOff  bool   `json:"is_day_off"`
}

type setWorkingHoursInput struct {
	DayOfWeek string `json:"day_of_week" binding:"required"`
	TimeStart string `json:"time_start" binding:"required"`
	TimeEnd   string `json:"time_end" binding:"required"`
}

// SetDayOff задает выходной день для мастера
// @Summary      Set day off for master
// @Description  Mark/unmark a day of week as day off
// @Tags         schedule
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        input body setDayOffInput true "Day off input"
// @Success      200  "OK"
// @Failure      400  {object} ErrorResponse
// @Failure      401  {object} ErrorResponse
// @Failure      500  {object} ErrorResponse
// @Router       /schedule/dayoff [put]
func (h *Handler) SetDayOff(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	var input setDayOffInput
	if err := c.ShouldBindJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "bad data", c)
		return
	}

	err := h.s.Schedules.SetDayOff(c.Request.Context(), claims.Id, strings.ToLower(input.DayOfWeek), input.IsDayOff)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "can't set days off", c)
		return
	}

	c.Status(http.StatusOK)
}

// SetWorkingHours задает рабочие часы для мастера
// @Summary      Set working hours for master
// @Description  Update working hours for a day of week
// @Tags         schedule
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        input body setWorkingHoursInput true "Working hours input"
// @Success      200  "OK"
// @Failure      400  {object} ErrorResponse
// @Failure      401  {object} ErrorResponse
// @Failure      500  {object} ErrorResponse
// @Router       /schedule/hours [put]
func (h *Handler) SetWorkingHours(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	var input setWorkingHoursInput
	if err := c.ShouldBindJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "bad data", c)
		return
	}

	err := h.s.Schedules.UpdateWorkingHours(
		c.Request.Context(),
		claims.Id,
		strings.ToLower(input.DayOfWeek),
		input.TimeStart,
		input.TimeEnd,
	)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "can't set working hours", c)
		return
	}

	c.Status(http.StatusOK)
}
