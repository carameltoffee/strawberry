package handlers

import "github.com/gin-gonic/gin"

type ErrorResponse struct {
	Error string `json:"error"`
}

func newErrorResponse(code int, msg string, c *gin.Context) {
	c.JSON(code, ErrorResponse{
		Error: msg,
	})
}
