package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strawberry/internal/handlers"
	"strawberry/internal/models"
	"strawberry/internal/service"
	mock_service "strawberry/internal/service/mocks"
	mock_jwt "strawberry/pkg/jwt/mocks"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

const userCtxKey = "userId"

func setup() (*handlers.Handler, *mock_service.Users, *mock_service.Appointments) {
	userMock := new(mock_service.Users)
	apptMock := new(mock_service.Appointments)
	jwtMock := new(mock_jwt.JwtManager)

	svc := &service.Service{
		Users:        userMock,
		Appointments: apptMock,
	}
	h := handlers.New(svc, jwtMock)
	return h, userMock, apptMock
}

func TestRegister_Success(t *testing.T) {
	h, usersMock, _ := setup()

	input := handlers.RegisterReq{
		FullName:       "Alice",
		Username:       "alice",
		Password:       "secure",
		Specialization: "master",
	}
	expectedID := int64(101)

	usersMock.On("Create", mock.Anything, mock.AnythingOfType("*models.User")).Return(expectedID, nil)

	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	h.Register(c)

	require.Equal(t, http.StatusCreated, w.Code)
	var resp handlers.RegisterRes
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	require.Equal(t, expectedID, resp.Id)

	usersMock.AssertExpectations(t)
}

func TestLogin_InvalidCredentials(t *testing.T) {
	h, usersMock, _ := setup()

	usersMock.On("Login", mock.Anything, "bob", "wrongpass").
		Return("", service.ErrInvalidCredentials)

	body, _ := json.Marshal(handlers.LoginReq{
		Username: "bob",
		Password: "wrongpass",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	h.Login(c)

	require.Equal(t, http.StatusUnauthorized, w.Code)
	usersMock.AssertExpectations(t)
}

func TestGetMasterByUsername_NotFound(t *testing.T) {
	h, usersMock, _ := setup()

	usersMock.On("GetByUsername", mock.Anything, "ghost").
		Return(nil, service.ErrUserNotFound)

	req := httptest.NewRequest(http.MethodGet, "/api/masters/ghost", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = gin.Params{{Key: "username", Value: "ghost"}}
	c.Request = req

	h.GetMasterByUsername(c)

	require.Equal(t, http.StatusNotFound, w.Code)
	usersMock.AssertExpectations(t)
}

func TestCreateAppointment_Success(t *testing.T) {
	h, _, apptMock := setup()

	userID := int64(1)
	masterID := int64(2)
	scheduledAt := time.Date(2025, 5, 28, 0, 0, 0, 0, time.UTC)

	input := handlers.AppointmentReq{
		MasterID: masterID,
		Time:     "2025-05-28",
	}

	apptMock.On("Create", mock.Anything, mock.MatchedBy(func(a *models.Appointment) bool {
		return a.UserID == userID &&
			a.MasterID == masterID &&
			a.ScheduledAt.Equal(scheduledAt)
	})).Return(int64(55), nil)

	body, _ := json.Marshal(input)
	req := httptest.NewRequest(http.MethodPost, "/api/appointments", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Set(userCtxKey, userID)

	h.CreateAppointment(c)

	require.Equal(t, http.StatusCreated, w.Code)
	apptMock.AssertExpectations(t)
}

func TestGetAppointments_Success(t *testing.T) {
	h, _, apptMock := setup()

	userID := int64(123)
	appointments := []models.Appointment{
		{
			ID:          1,
			UserID:      userID,
			MasterID:    2,
			ScheduledAt: time.Date(2025, 5, 28, 12, 0, 0, 0, time.UTC),
			Status:      "confirmed",
		},
	}
	apptMock.On("GetByUserId", mock.Anything, userID).Return(appointments, nil)

	req := httptest.NewRequest(http.MethodGet, "/api/appointments", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Set("userId", userID)

	h.GetAppointments(c)

	require.Equal(t, http.StatusOK, w.Code)
	apptMock.AssertExpectations(t)
}

func TestDeleteAppointment_Success(t *testing.T) {
	h, _, apptMock := setup()

	userID := int64(1)
	appointmentID := int64(10)

	apptMock.On("Delete", mock.Anything, appointmentID, userID).Return(nil)

	req := httptest.NewRequest(http.MethodDelete, "/api/appointments/10", nil)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "10"}}
	c.Set(userCtxKey, userID)

	h.DeleteAppointment(c)

	require.Equal(t, http.StatusNoContent, w.Code)
	apptMock.AssertExpectations(t)
}
