package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type SendVerificationCodeReq struct {
	Email string `json:"email"`
}

// SendVerificationCode godoc
// @Summary      Send verification code
// @Description  Sends a verification code to the provided email address
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input  body      SendVerificationCodeReq  true  "Email input"
// @Success      200    {string}  string                   "OK"
// @Failure      400    {object}  ErrorResponse            "Invalid email format"
// @Failure      500    {object}  ErrorResponse            "Could not send code"
// @Router       /send-code [post]
func (h *Handler) SendVerificationCode(c *gin.Context) {
	var input SendVerificationCodeReq
	if err := c.ShouldBindBodyWithJSON(&input); err != nil {
		newErrorResponse(http.StatusBadRequest, "invalid email format", c)
		return
	}
	if _, err := h.s.VerificationCode.SendCode(c, input.Email); err != nil {
		newErrorResponse(http.StatusInternalServerError, "could not send code", c)
		return
	}
	c.Status(http.StatusOK)
}
