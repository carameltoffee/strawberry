package handlers

import (
	"errors"
	"net/http"
	"strawberry/internal/models"
	"strawberry/internal/service"

	"github.com/gin-gonic/gin"
)

type RegisterReq struct {
	FullName       string `json:"full_name"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	Specialization string `json:"specialization"`
}

type RegisterRes struct {
	Id int64 `json:"id"`
}

// @Summary Register a new user or master
// @Description Create a new user or master account
// @Tags auth
// @Accept json
// @Produce json
// @Param input body RegisterReq true "registration data"
// @Success 201 {object} RegisterRes
// @Failure 400 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /register [post]
func (h *Handler) Register(c *gin.Context) {
	var data *RegisterReq
	if err := c.ShouldBindBodyWithJSON(&data); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid data", c)
		return
	}
	if data.Specialization == "" {
		data.Specialization = "user"
	}
	user := &models.User{
		FullName:       data.FullName,
		Email:          data.Email,
		Username:       data.Username,
		Password:       data.Password,
		Specialization: data.Specialization,
		AverageRating:  5,
	}

	id, err := h.s.Users.Create(c.Request.Context(), user)
	if err != nil {
		if errors.Is(err, service.ErrInternal) {
			newErrorResponse(http.StatusInternalServerError, "something on our side", c)
			return
		}
		if errors.Is(err, service.ErrUserExists) {
			newErrorResponse(http.StatusConflict, "user already exists", c)
			return
		}
		var valErr service.ValidationError
		if errors.As(err, &valErr) {
			newErrorResponse(http.StatusBadRequest, valErr.Msg, c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "unknown error", c)
		return
	}
	c.JSON(http.StatusCreated, &RegisterRes{
		Id: id,
	})
}

type LoginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRes struct {
	Token string `json:"token"`
}

// @Summary Login user
// @Description Authenticate user and return a JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param input body LoginReq true "login credentials"
// @Success 200 {object} LoginRes
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /login [post]
func (h *Handler) Login(c *gin.Context) {
	var data *LoginReq
	if err := c.ShouldBindJSON(&data); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid credentials format", c)
		return
	}

	token, err := h.s.Users.Login(c.Request.Context(), data.Username, data.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			newErrorResponse(http.StatusUnauthorized, "invalid username or password", c)
			return
		}
		newErrorResponse(http.StatusInternalServerError, "auth error", c)
		return
	}

	c.JSON(http.StatusOK, &LoginRes{Token: token})
}
