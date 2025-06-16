package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strawberry/pkg/jwt"

	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

type IdResponse struct {
	Id string `json:"id"`
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

func sendFile(c *gin.Context, reader io.ReadCloser, contentType, filename string, contentLength int64) {
	defer reader.Close()

	if contentType == "" {
		contentType = "application/octet-stream"
	}
	c.Header("Content-Type", contentType)

	if filename != "" {
		c.Header("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, filename))
	}

	if contentLength > 0 {
		c.Header("Content-Length", fmt.Sprintf("%d", contentLength))
	}

	if _, err := io.Copy(c.Writer, reader); err != nil {
		return
	}
	c.Status(http.StatusOK)
}
