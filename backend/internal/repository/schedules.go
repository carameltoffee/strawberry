package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type postgresSchedulesRepository struct {
	db *pgxpool.Pool
}

func newPostgresSchedulesRepository(db *pgxpool.Pool) *postgresSchedulesRepository {
	return &postgresSchedulesRepository{db: db}
}

func (r *postgresSchedulesRepository) SetDayOff(ctx context.Context, userID int64, dayOfWeek string, isDayOff bool) error {
	query := `
		INSERT INTO schedules (user_id, day_of_week, time_start, time_end, is_day_off)
		VALUES ($1, LOWER($2), '00:00', '00:00', $3)
		ON CONFLICT (user_id, day_of_week)
		DO UPDATE SET is_day_off = $3;
	`
	_, err := r.db.Exec(ctx, query, userID, dayOfWeek, isDayOff)
	return err
}

func (r *postgresSchedulesRepository) UpdateWorkingHours(ctx context.Context, userID int64, dayOfWeek, timeStart, timeEnd string) error {
	query := `
		INSERT INTO schedules (user_id, day_of_week, time_start, time_end, is_day_off)
		VALUES ($1, LOWER($2), $3::time, $4::time, false)
		ON CONFLICT (user_id, day_of_week)
		DO UPDATE SET time_start = $3::time, time_end = $4::time, is_day_off = false;
	`
	_, err := r.db.Exec(ctx, query, userID, dayOfWeek, timeStart, timeEnd)
	return err
}
