package handlers

import (
	"strawberry/pkg/jwt"

	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func newErrorResponse(code int, msg string, c *gin.Context) {
	c.JSON(code, ErrorResponse{
		Error: msg,
	})
}

func getClaims(c *gin.Context) (*jwt.CustomClaims, bool) {
	val, ok := c.Get(userCtxKey)
	if !ok {
		return nil, false
	}
	return val.(*jwt.CustomClaims), true
}
