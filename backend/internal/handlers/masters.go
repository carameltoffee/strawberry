package handlers

import (
	"errors"
	"fmt"
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

// @Summary Get list of masters
// @Description Get masters filtered by specialization and/or minimum average rating
// @Tags masters
// @Accept json
// @Produce json
// @Param specialization query string false "Filter by specialization"
// @Param min_rating query number false "Filter by minimum average rating"
// @Success 200 {array} models.User
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /masters [get]
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

// @Summary Get master by username
// @Description Fetch a master's profile using their username
// @Tags masters
// @Accept json
// @Produce json
// @Param username path string true "Master's username"
// @Success 200 {object} models.User
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /masters/{username} [get]
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

	c.JSON(http.StatusOK, master)
}

func (h *Handler) GetMasterById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid id", c)
		return
	}
	master, err := h.s.Users.GetById(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			newErrorResponse(http.StatusNotFound, "no users found", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "internal", c)
		return
	}
	c.JSON(http.StatusOK, master)
}

// GetAvatar godoc
// @Summary      Get user's avatar
// @Description  Returns the avatar image file for the given user ID
// @Tags         avatar
// @Produce      image/jpeg
// @Param        id   path      int  true  "User ID"
// @Success      200  {file}    file
// @Failure      400  {object}  ErrorResponse  "invalid id"
// @Failure      500  {object}  ErrorResponse  "something went wrong"
// @Router       /users/{id}/avatar [get]
func (h *Handler) GetAvatar(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid id", c)
		return
	}

	cl, err := h.s.File.GetAvatar(c.Request.Context(), id)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "something went wrong", c)
		return
	}
	sendFile(c, cl, "image/jpeg", "avatar.jpg", 0)
}

// UploadAvatar godoc
// @Summary      Upload user's avatar
// @Description  Uploads and stores the avatar image for the authorized user
// @Tags         avatar
// @Accept       multipart/form-data
// @Produce      json
// @Param        avatar  formData  file  true  "Avatar file"
// @Success      200     {string}  string  "ok"
// @Failure      400     {object}  ErrorResponse  "can't find or open file"
// @Failure      401     {object}  ErrorResponse  "unauthorized"
// @Failure      500     {object}  ErrorResponse  "can't upload file to our server"
// @Security     BearerAuth
// @Router       /users/avatar [post]
func (h *Handler) UploadAvatar(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}
	formFile, err := c.FormFile("avatar")
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "can't find file", c)
		return
	}
	file, err := formFile.Open()
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "can't open file", c)
		return
	}
	defer file.Close()

	err = h.s.File.UploadAvatar(c.Request.Context(), claims.Id, file, formFile.Size, formFile.Header.Get("Content-Type"))
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "can't upload file to our server", c)
		return
	}
	c.Status(http.StatusOK)
}

// @Summary Upload master's work
// @Description Uploads a file (e.g. image) representing master's work
// @Tags master
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param work formData file true "Work file"
// @Success 200 {string} string "ok"
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/works [post]
func (h *Handler) UploadMasterWork(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}
	fileH, err := c.FormFile("work")
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "no work provided", c)
		return
	}
	file, err := fileH.Open()
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "can't open file", c)
		return
	}
	defer file.Close()
	_, err = h.s.File.UploadWork(c.Request.Context(), claims.Id, file, fileH.Size, fileH.Header.Get("Content-Type"))
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "can't upload file to server", c)
		return
	}
	c.Status(http.StatusOK)
}

// @Summary Get master work IDs
// @Description Returns list of work IDs uploaded by the master
// @Tags master
// @Produce json
// @Param id path int true "Master ID"
// @Success 200 {array} string
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/{id}/works [get]
func (h *Handler) GetMasterWorks(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "bad id", c)
		return
	}
	ids, err := h.s.File.GetWorks(c.Request.Context(), id)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "cannot get works", c)
		return
	}
	c.JSON(http.StatusOK, ids)
}

// @Summary Get master work file
// @Description Returns a specific work file uploaded by the master
// @Tags master
// @Produce image/png
// @Param id path int true "Master ID"
// @Param workId path string true "Work ID"
// @Success 200 {file} file
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /users/{id}/works/{workId} [get]
func (h *Handler) GetMasterWork(c *gin.Context) {
	userIdStr := c.Param("id")
	workIdStr := c.Param("workId")
	id, err := strconv.ParseInt(userIdStr, 10, 64)
	if err != nil {
		newErrorResponse(http.StatusBadRequest, "bad id", c)
		return
	}
	file, err := h.s.File.GetWork(c.Request.Context(), id, workIdStr)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "cannot get works", c)
		return
	}
	sendFile(c, file, "image/png", fmt.Sprintf("%s.png", workIdStr), 0)
}

// @Summary Delete master work slot
// @Tags master
// @Description Deletes a work slot belonging to the authenticated master
// @Security BearerAuth
// @Param id path string true "Work ID"
// @Success 200 {string} string "OK"
// @Failure 401 {object} ErrorResponse "Unauthorized"
// @Failure 500 {object} ErrorResponse "Internal Server Error"
// @Router /masters/works/{id} [delete]
func (h *Handler) DeleteMasterWork(c *gin.Context) {
	claims, ok := getClaims(c)
	if !ok {
		newErrorResponse(http.StatusUnauthorized, "unauthorized", c)
		return
	}
	workId := c.Param("id")
	err := h.s.File.DeleteWork(c.Request.Context(), claims.Id, workId)
	if err != nil {
		newErrorResponse(http.StatusInternalServerError, "cannot delete work", c)
		return
	}
	c.Status(http.StatusOK)
}
