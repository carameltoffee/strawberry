package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type postgresSchedulesRepository struct {
	db *pgxpool.Pool
}

func newPostgresSchedulesRepository(db *pgxpool.Pool) *postgresSchedulesRepository {
	return &postgresSchedulesRepository{db: db}
}

func (r *postgresSchedulesRepository) SetDayOff(ctx context.Context, userID int64, date time.Time, isDayOff bool) error {
	if isDayOff {
		_, err := r.db.Exec(ctx,
			`INSERT INTO days_off_dates (user_id, date) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			userID, date)
		return err
	}

	_, err := r.db.Exec(ctx,
		`DELETE FROM days_off_dates WHERE user_id = $1 AND date = $2`,
		userID, date)
	return err
}

func (r *postgresSchedulesRepository) SetWorkingSlotsByWeekDay(ctx context.Context, userID int64, dayOfWeek string, slots []string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		DELETE FROM schedule_slots WHERE user_id = $1 AND day_of_week = LOWER($2)
	`, userID, dayOfWeek)
	if err != nil {
		return err
	}

	for _, slot := range slots {
		_, err := tx.Exec(ctx, `
			INSERT INTO schedule_slots (user_id, day_of_week, slot)
			VALUES ($1, LOWER($2), $3::time)
		`, userID, dayOfWeek, slot)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *postgresSchedulesRepository) SetWorkingSlotsByDate(ctx context.Context, userId int64, date time.Time, slots []string) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		DELETE FROM date_slots WHERE user_id = $1 AND date = $2
	`, userId, date.Format("2006-01-02"))
	if err != nil {
		return err
	}

	for _, slot := range slots {
		_, err := tx.Exec(ctx, `
			INSERT INTO date_slots (user_id, date, slot) VALUES ($1, $2, $3)
		`, userId, date.Format("2006-01-02"), slot)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *postgresSchedulesRepository) DeleteWorkingSlotsByDate(ctx context.Context, userId int64, date time.Time) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM date_slots WHERE user_id = $1 AND date = $2
	`, userId, date.Format("2006-01-02"))
	if err != nil {
		return err
	}
	return nil
}

func (r *postgresSchedulesRepository) GetDaysOff(ctx context.Context, userId int64) ([]time.Time, error) {
	query := `
		SELECT date 
		FROM days_off_dates 
		WHERE user_id = $1 AND date >= CURRENT_DATE
		ORDER BY date;
	`
	rows, err := r.db.Query(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dates []time.Time
	for rows.Next() {
		var d time.Time
		if err := rows.Scan(&d); err != nil {
			return nil, err
		}
		dates = append(dates, d)
	}
	return dates, nil
}

func (r *postgresSchedulesRepository) GetSlotsByDay(ctx context.Context, userId int64, date time.Time, dayOfWeek string) ([]time.Time, error) {
	queryDateSlots :=
		`SELECT slot 
        FROM date_slots 
        WHERE user_id = $1 AND date = $2
        ORDER BY slot;`

	rows, err := r.db.Query(ctx, queryDateSlots, userId, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var slots []time.Time
	for rows.Next() {
		var slot time.Time
		if err := rows.Scan(&slot); err != nil {
			return nil, err
		}
		slots = append(slots, slot)
	}

	if len(slots) > 0 {
		return slots, nil
	}

	queryScheduleSlots :=
		`SELECT slot 
        FROM schedule_slots 
        WHERE user_id = $1 AND day_of_week = LOWER($2)
        ORDER BY slot;`

	rows, err = r.db.Query(ctx, queryScheduleSlots, userId, dayOfWeek)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var slot time.Time
		if err := rows.Scan(&slot); err != nil {
			return nil, err
		}
		slots = append(slots, slot)
	}

	return slots, nil
}
