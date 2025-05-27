package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"strawberry/internal/models"
)

type postgresUsersRepository struct {
	db *pgxpool.Pool
}

func newPostgresUsersRepository(db *pgxpool.Pool) Users {
	return &postgresUsersRepository{db: db}
}

func (r *postgresUsersRepository) Create(ctx context.Context, us *models.User) (int64, error) {
	query := `
		INSERT INTO users (full_name, username, password, average_rating, specialization)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id;
	`
	var id int64
	err := r.db.QueryRow(ctx, query,
		us.FullName, us.Username, us.Password, us.AverageRating, us.Specialization).Scan(&id)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return 0, ErrUserExists
		}
		return 0, err
	}
	return id, nil
}

func (r *postgresUsersRepository) Update(ctx context.Context, us *models.User) error {
	query := `
		UPDATE users 
		SET full_name = $1, username = $2, password = $3, average_rating = $4, specialization = $5
		WHERE id = $6;
	`
	cmdTag, err := r.db.Exec(ctx, query,
		us.FullName, us.Username, us.Password, us.AverageRating, us.Specialization, us.Id)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return ErrNoUsers
	}
	return nil
}

func (r *postgresUsersRepository) Delete(ctx context.Context, id int64) error {
	cmdTag, err := r.db.Exec(ctx, "DELETE FROM users WHERE id = $1;", id)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return ErrNoUsers
	}
	return nil
}

func (r *postgresUsersRepository) GetByFullName(ctx context.Context, fn string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, full_name, username, password, registered_at, average_rating, specialization
		FROM users WHERE full_name = $1;
	`, fn)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.RegisteredAt, &u.AverageRating, &u.Specialization); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	if len(users) == 0 {
		return nil, ErrNoUsers
	}
	return users, nil
}

func (r *postgresUsersRepository) GetByUsername(ctx context.Context, un string) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, full_name, username, password, registered_at, average_rating, specialization
		FROM users WHERE username = $1;
	`, un)

	var u models.User
	err := row.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.RegisteredAt, &u.AverageRating, &u.Specialization)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNoUsers
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *postgresUsersRepository) GetMastersByRating(ctx context.Context) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, full_name, username, password, registered_at, average_rating, specialization
		FROM users WHERE specialization != 'user'
		ORDER BY average_rating DESC;
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.RegisteredAt, &u.AverageRating, &u.Specialization); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	if len(users) == 0 {
		return nil, ErrNoUsers
	}
	return users, nil
}

func (r *postgresUsersRepository) GetMastersBySpecialization(ctx context.Context, s string) ([]models.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, full_name, username, password, registered_at, average_rating, specialization
		FROM users WHERE specialization = $1;
	`, s)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.RegisteredAt, &u.AverageRating, &u.Specialization); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	if len(users) == 0 {
		return nil, ErrNoUsers
	}
	return users, nil
}

func (r *postgresUsersRepository) GetById(ctx context.Context, id int64) (*models.User, error) {
	row := r.db.QueryRow(ctx, `
		SELECT id, full_name, username, registered_at, average_rating, specialization
		FROM users WHERE id = $1;
	`, id)

	var u models.User
	err := row.Scan(&u.Id, &u.FullName, &u.Username, &u.RegisteredAt, &u.AverageRating, &u.Specialization)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNoUsers
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
