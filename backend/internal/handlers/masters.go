package handlers

import (
	"errors"
	"net/http"
	"strawberry/internal/models"
	"strawberry/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MasterFilter struct {
	Specialization string  `form:"specialization"`
	MinRating      float64 `form:"min_rating"`
}

func (h *Handler) GetMasters(c *gin.Context) {
	specialization := c.Query("specialization")
	minRatingStr := c.Query("min_rating")

	var mastersBySpec []models.User
	var mastersByRating []models.User
	var err error

	if specialization != "" {
		mastersBySpec, err = h.s.Users.GetMastersBySpecialization(c.Request.Context(), specialization)
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get masters by specialization", c)
			return
		}
	}

	if minRatingStr != "" {
		minRating, err := strconv.ParseFloat(minRatingStr, 64)
		if err != nil {
			newErrorResponse(http.StatusBadRequest, "invalid min_rating", c)
			return
		}

		mastersByRating, err = h.s.Users.GetMastersByRating(c.Request.Context())
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get masters by rating", c)
			return
		}

		filtered := []models.User{}
		for _, m := range mastersByRating {
			if m.AverageRating >= minRating {
				filtered = append(filtered, m)
			}
		}
		mastersByRating = filtered
	}
	var result []models.User

	switch {
	case specialization != "" && minRatingStr != "":
		mById := make(map[int64]models.User)
		for _, m := range mastersBySpec {
			mById[m.Id] = m
		}
		for _, m := range mastersByRating {
			if _, ok := mById[m.Id]; ok {
				result = append(result, m)
			}
		}
	case specialization != "":
		result = mastersBySpec
	case minRatingStr != "":
		result = mastersByRating
	default:
		result, err = h.s.Users.GetMastersByRating(c.Request.Context())
		if err != nil {
			newErrorResponse(http.StatusInternalServerError, "failed to get masters", c)
			return
		}
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetMasterByUsername(c *gin.Context) {
	usernameStr := c.Param("username")

	master, err := h.s.Users.GetByUsername(c.Request.Context(), usernameStr)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			newErrorResponse(http.StatusNotFound, "master not found", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "could not fetch master", c)
		return
	}

	if master.Specialization == "user" {
		newErrorResponse(http.StatusBadRequest, "not a master", c)
		return
	}

	c.JSON(http.StatusOK, master)
}
