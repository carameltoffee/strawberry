package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type setDayOffInput struct {
	Date     string `json:"date" binding:"required"`
	IsDayOff bool   `json:"is_day_off"`
}

type setWorkingSlotsInput struct {
	DayOfWeek string   `json:"day_of_week" binding:"required"`
	Slots     []string `json:"slots" binding:"required,min=1"`
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

	err := h.s.Schedules.SetDayOff(c.Request.Context(), claims.Id, input.Date, input.IsDayOff)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "can't set days off", c)
		return
	}

	c.Status(http.StatusOK)
}

// SetWorkingHours задает конкретные часы приема для мастера
// @Summary      Set working slots for master
// @Description  Update exact time slots for a day of week
// @Tags         schedule
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        input body setWorkingSlotsInput true "Working slots input"
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

	var input setWorkingSlotsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "bad data", c)
		return
	}

	if len(input.Slots) == 0 {
		newErrorResponse(http.StatusBadRequest, "slots required", c)
		return
	}

	err := h.s.Schedules.SetWorkingSlots(
		c.Request.Context(),
		claims.Id,
		strings.ToLower(input.DayOfWeek),
		input.Slots,
	)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "can't set working slots", c)
		return
	}

	c.Status(http.StatusOK)
}

// GetTodaySchedule возвращает расписание на сегодня для текущего пользователя
// @Summary      Get today's schedule
// @Description  Get working schedule slots for the current user for today
// @Tags         schedule
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object} models.Schedule  "Today's schedule"
// @Failure      401  {object} ErrorResponse
// @Failure      500  {object} ErrorResponse
// @Router       /schedule/today [get]
func (h *Handler) GetTodaySchedule(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	ctx := c.Request.Context()
	userId := claims.Id

	schedule, err := h.s.Schedules.GetTodaySchedule(ctx, userId)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "failed to get working slots", c)
		return
	}
	c.JSON(http.StatusOK, schedule)
}
