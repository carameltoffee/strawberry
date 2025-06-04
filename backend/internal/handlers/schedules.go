package handlers

import (
	"errors"
	"net/http"
	"strawberry/internal/service"
	"strconv"
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

// SetWorkingHours задает конкретные часы приема для мастера в конкретный день недели
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
// @Router       /schedule/hours/weekday [put]
func (h *Handler) SetWorkingSlotsByWeekDay(c *gin.Context) {
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

	err := h.s.Schedules.SetWorkingSlotsByWeekDay(
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

// GetSchedule возвращает расписание на сегодня для текущего пользователя
// @Summary      Get today's schedule
// @Description  Get working schedule slots for the current user for today
// @Param date query string true "date"
// @Param id path int true "user's id"
// @Tags         schedule
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object} models.TodaySchedule  "Today's schedule"
// @Failure      401  {object} ErrorResponse
// @Failure      500  {object} ErrorResponse
// @Router       /schedule/{id} [get]
func (h *Handler) GetSchedule(c *gin.Context) {
	ctx := c.Request.Context()
	userIdStr := c.Param("id")
	date := c.Query("date")

	userId, err := strconv.ParseInt(userIdStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid id", c)
		return
	}

	schedule, err := h.s.Schedules.GetSchedule(ctx, date, userId)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "failed to get working slots", c)
		return
	}
	c.JSON(http.StatusOK, schedule)
}

type SetWorkingSlotsReq struct {
	Date  string   `json:"date" binding:"required"`
	Slots []string `json:"slots" binding:"required"`
}

// SetWorkingSlotsByDate sets available working time slots for a specific user on a given date.
// @Summary Set working slots
// @Description Set available time slots for a given date (master only).
// @Tags schedule
// @Accept json
// @Produce json
// @Param input body SetWorkingSlotsReq true "working slots info"
// @Security     BearerAuth
// @Success 204 {string} string "No Content"
// @Failure 400 {object} ErrorResponse "Invalid input or bad date"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /schedule/hours/date [put]
func (h *Handler) SetWorkingSlotsByDate(c *gin.Context) {
	ctx := c.Request.Context()
	var input *SetWorkingSlotsReq

	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid input: "+err.Error(), c)
		return
	}

	err := h.s.Schedules.SetWorkingSlotsByDate(ctx, claims.Id, input.Date, input.Slots)
	if err != nil {
		if errors.Is(err, service.ErrBadDate) {
			newErrorResponse(http.StatusBadRequest, "bad date", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "failed to set working slots", c)
		return
	}

	c.Status(http.StatusOK)
}

// DeleteWorkingSlotsByDate deletes all working slots for the authenticated master on a specific date.
// @Summary Delete working slots
// @Description Delete all working slots for a given date (master only).
// @Tags schedule
// @Produce json
// @Param date query string true "Date in YYYY-MM-DD format"
// @Security     BearerAuth
// @Success 204 {string} string "No Content"
// @Failure 400 {object} ErrorResponse "Missing or invalid date"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /schedule/hours/date [delete]
func (h *Handler) DeleteWorkingSlotsByDate(c *gin.Context) {
	ctx := c.Request.Context()

	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	date := c.Query("date")

	if date == "" {
		newErrorResponse(http.StatusBadRequest, "missing ''date' query parameter", c)
		return
	}

	err := h.s.Schedules.DeleteWorkingSlotsByDate(ctx, claims.Id, date)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "failed to delete working slots", c)
		return
	}

	c.Status(http.StatusNoContent)
}
