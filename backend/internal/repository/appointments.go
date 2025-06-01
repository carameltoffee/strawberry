package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"strawberry/internal/models"
)

type postgresAppointmentsRepository struct {
	db *pgxpool.Pool
}

func newPostgresAppointmentsRepository(db *pgxpool.Pool) Appointments {
	return &postgresAppointmentsRepository{db: db}
}

func (r *postgresAppointmentsRepository) Create(ctx context.Context, a *models.Appointment) (int64, error) {
	dayOfWeek := strings.ToLower(a.ScheduledAt.Weekday().String())
	timeOfDay := a.ScheduledAt.Format("15:04:05")
	date := a.ScheduledAt.Format("2006-01-02")

	var offCount int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM days_off_dates WHERE user_id = $1 AND date = $2`,
		a.MasterID, date,
	).Scan(&offCount)
	if err != nil {
		return 0, err
	}
	if offCount > 0 {
		return 0, ErrMasterUnavailable
	}

	var slotCount int
	err = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM schedule_slots WHERE user_id = $1 AND day_of_week = $2 AND slot = $3`,
		a.MasterID, dayOfWeek, timeOfDay,
	).Scan(&slotCount)
	if err != nil {
		return 0, err
	}
	if slotCount == 0 {
		return 0, ErrMasterUnavailable
	}

	query := `
		INSERT INTO appointments (user_id, master_id, scheduled_at, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id;
	`
	var id int64
	err = r.db.QueryRow(ctx, query, a.UserID, a.MasterID, a.ScheduledAt, a.Status).Scan(&id)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return 0, ErrAppointmentConflict
		}
		return 0, err
	}
	return id, nil
}

func (r *postgresAppointmentsRepository) Delete(ctx context.Context, id int64) error {
	cmdTag, err := r.db.Exec(ctx, "DELETE FROM appointments WHERE id = $1;", id)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return ErrNoAppointments
	}
	return nil
}

func (r *postgresAppointmentsRepository) GetByUserId(ctx context.Context, id int64) ([]models.Appointment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, master_id, scheduled_at, created_at, status
		FROM appointments WHERE user_id = $1;
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apts []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(&a.ID, &a.UserID, &a.MasterID, &a.ScheduledAt, &a.CreatedAt, &a.Status); err != nil {
			return nil, err
		}
		apts = append(apts, a)
	}
	if len(apts) == 0 {
		return nil, ErrNoAppointments
	}
	return apts, nil
}

func (r *postgresAppointmentsRepository) GetByMasterId(ctx context.Context, id int64) ([]models.Appointment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, master_id, scheduled_at, created_at, status
		FROM appointments WHERE master_id = $1;
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apts []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(&a.ID, &a.UserID, &a.MasterID, &a.ScheduledAt, &a.CreatedAt, &a.Status); err != nil {
			return nil, err
		}
		apts = append(apts, a)
	}
	if len(apts) == 0 {
		return nil, ErrNoAppointments
	}
	return apts, nil
}

func (r *postgresAppointmentsRepository) GetByDate(ctx context.Context, id int64, date time.Time) ([]models.Appointment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, master_id, scheduled_at, created_at, status
		FROM appointments 
		WHERE master_id = $1 AND DATE(scheduled_at) = $2;
	`, id, date.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apts []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(&a.ID, &a.UserID, &a.MasterID, &a.ScheduledAt, &a.CreatedAt, &a.Status); err != nil {
			return nil, err
		}
		apts = append(apts, a)
	}
	if len(apts) == 0 {
		return nil, ErrNoAppointments
	}
	return apts, nil
}

func (r *postgresAppointmentsRepository) GetByStatus(ctx context.Context, status string) ([]models.Appointment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, user_id, master_id, scheduled_at, created_at, status
		FROM appointments WHERE status = $1;
	`, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apts []models.Appointment
	for rows.Next() {
		var a models.Appointment
		if err := rows.Scan(&a.ID, &a.UserID, &a.MasterID, &a.ScheduledAt, &a.CreatedAt, &a.Status); err != nil {
			return nil, err
		}
		apts = append(apts, a)
	}
	if len(apts) == 0 {
		return nil, ErrNoAppointments
	}
	return apts, nil
}

func (r *postgresAppointmentsRepository) GetById(ctx context.Context, id int64) (*models.Appointment, error) {
	query := `
		SELECT id, user_id, master_id, scheduled_at, created_at, status
		FROM appointments
		WHERE id = $1;
	`
	var a models.Appointment
	err := r.db.QueryRow(ctx, query, id).Scan(
		&a.ID,
		&a.UserID,
		&a.MasterID,
		&a.ScheduledAt,
		&a.CreatedAt,
		&a.Status,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNoAppointments
		}
		return nil, err
	}
	return &a, nil
}
