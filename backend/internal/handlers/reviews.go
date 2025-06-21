package handlers

import (
	"errors"
	"net/http"
	"strawberry/internal/models"
	"strawberry/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateReviewReq struct {
	MasterId int64  `json:"master_id"`
	Comment  string `json:"comment"`
	Rating   int    `json:"rating"`
}

// CreateReview создает новый отзыв
// @Summary Создать отзыв
// @Tags reviews
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param review body CreateReviewReq true "Данные отзыва"
// @Success 201 {object} models.Review
// @Failure 400 {object} ErrorResponse "Неверные данные запроса"
// @Failure 401 {object} ErrorResponse "Неавторизован"
// @Failure 500 {object} ErrorResponse "Внутренняя ошибка сервера"
// @Router /reviews [post]
func (h *Handler) CreateReview(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	var input CreateReviewReq
	if err := c.ShouldBindJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid input data", c)
		return
	}

	review := &models.Review{
		UserId:   claims.Id,
		MasterId: input.MasterId,
		Rating:   input.Rating,
		Comment:  input.Comment,
	}

	if err := h.s.Reviews.Create(c.Request.Context(), review); err != nil {
		if errors.Is(err, service.ErrNoPastAppointments) {
			newErrorResponse(http.StatusForbidden, "you can't make a review without visiting the master", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "cannot create review", c)
		return
	}

	c.JSON(http.StatusCreated, input)
}

// GetReviewsByMasterId получает отзывы по ID мастера
// @Summary Получить отзывы мастера
// @Tags reviews
// @Produce json
// @Param master_id path int true "ID мастера"
// @Success 200 {array} models.Review
// @Failure 400 {object} ErrorResponse "Неверный ID мастера"
// @Failure 500 {object} ErrorResponse "Внутренняя ошибка сервера"
// @Router /reviews/master/{master_id} [get]
func (h *Handler) GetReviewsByMasterId(c *gin.Context) {
	masterIdStr := c.Param("master_id")
	masterId, err := strconv.ParseInt(masterIdStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid master id", c)
		return
	}

	reviews, err := h.s.Reviews.GetByMasterId(c.Request.Context(), masterId)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "cannot get reviews", c)
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// UpdateReview godoc
// @Summary Обновить отзыв
// @Description Обновляет существующий отзыв пользователя
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path int true "ID отзыва"
// @Param review body models.Review true "Данные отзыва"
// @Success 200 {object} models.Review
// @Failure 400 {object} ErrorResponse "Неверные данные или ID"
// @Failure 401 {object} ErrorResponse "Неавторизован"
// @Failure 404 {object} ErrorResponse "Отзыв не найден"
// @Failure 500 {object} ErrorResponse "Ошибка сервера"
// @Security BearerAuth
// @Router /reviews/{id} [put]
func (h *Handler) UpdateReview(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid review id", c)
		return
	}

	var input models.Review
	if err := c.ShouldBindJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid input data", c)
		return
	}

	input.Id = id
	input.UserId = claims.Id

	err = h.s.Reviews.Update(c.Request.Context(), &input)
	if err != nil {
		if err == service.ErrNotFound {
			newErrorResponse(http.StatusNotFound, "review not found", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "cannot update review", c)
		return
	}

	c.JSON(http.StatusOK, input)
}

// DeleteReview godoc
// @Summary Удалить отзыв
// @Description Удаляет отзыв пользователя по ID
// @Tags reviews
// @Produce json
// @Param id path int true "ID отзыва"
// @Success 200 "Отзыв удалён"
// @Failure 400 {object} ErrorResponse "Неверный ID отзыва"
// @Failure 401 {object} ErrorResponse "Неавторизован"
// @Failure 404 {object} ErrorResponse "Отзыв не найден"
// @Failure 500 {object} ErrorResponse "Ошибка сервера"
// @Security BearerAuth
// @Router /reviews/{id} [delete]
func (h *Handler) DeleteReview(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid review id", c)
		return
	}

	err = h.s.Reviews.Delete(c.Request.Context(), claims.Id, id)
	if err != nil {
		if err == service.ErrNotFound {
			newErrorResponse(http.StatusNotFound, "review not found", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "cannot delete review", c)
		return
	}

	c.Status(http.StatusOK)
}
