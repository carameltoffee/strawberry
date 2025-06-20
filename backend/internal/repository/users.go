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

const (
	userSpec = "user"
)

type postgresUsersRepository struct {
	db *pgxpool.Pool
}

func newPostgresUsersRepository(db *pgxpool.Pool) Users {
	return &postgresUsersRepository{db: db}
}

func (r *postgresUsersRepository) Create(ctx context.Context, us *models.User) (int64, error) {
	query := `
		INSERT INTO users (full_name, username, password, email, specialization)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id;
	`
	var id int64
	err := r.db.QueryRow(ctx, query,
		us.FullName, us.Username, us.Password, us.Email, us.Specialization).Scan(&id)
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
		SET full_name = $1, username = $2, password = $3, email = $4, specialization = $5
		WHERE id = $6;
	`
	cmdTag, err := r.db.Exec(ctx, query,
		us.FullName, us.Username, us.Password, us.Email, us.Specialization, us.Id)
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
		SELECT id, full_name, username, password, email, registered_at, specialization
		FROM users WHERE full_name = $1;
	`, fn)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.Email, &u.RegisteredAt, &u.Specialization); err != nil {
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
		SELECT id, full_name, username, password, email, registered_at, specialization
		FROM users WHERE username = $1;
	`, un)

	var u models.User
	err := row.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.Email, &u.RegisteredAt, &u.Specialization)
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
		SELECT id, full_name, username, password, email, registered_at, specialization
		FROM users WHERE specialization != 'user';
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.Email, &u.RegisteredAt, &u.Specialization); err != nil {
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
		SELECT id, full_name, username, password, email, registered_at, specialization
		FROM users WHERE specialization = $1;
	`, s)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.Id, &u.FullName, &u.Username, &u.Password, &u.Email, &u.RegisteredAt, &u.Specialization); err != nil {
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
		SELECT id, full_name, username, email, registered_at, specialization
		FROM users WHERE id = $1;
	`, id)

	var u models.User
	err := row.Scan(&u.Id, &u.FullName, &u.Username, &u.Email, &u.RegisteredAt, &u.Specialization)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNoUsers
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *postgresUsersRepository) SearchUsers(ctx context.Context, query string) ([]models.User, error) {
	sqlQuery := `
        SELECT id, full_name, email, username, password, registered_at, specialization
        FROM users
        WHERE full_name ILIKE $1 OR username ILIKE $1 OR specialization ILIKE $1
    `
	likeQuery := "%" + query + "%"

	rows, err := r.db.Query(ctx, sqlQuery, likeQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.Id, &u.FullName, &u.Email, &u.Username, &u.Password, &u.RegisteredAt, &u.Specialization)
		if err != nil {
			return nil, err
		}
		if u.Specialization == userSpec {
			continue
		}
		users = append(users, u)
	}

	return users, nil
}

func (r *postgresUsersRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	const query = `
        SELECT id, full_name, email, username, password, registered_at, specialization
        FROM users
        WHERE email = $1
        LIMIT 1;
    `

	var user models.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.Id,
		&user.FullName,
		&user.Email,
		&user.Username,
		&user.Password,
		&user.RegisteredAt,
		&user.Specialization,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, ErrNoUsers
		}
		return nil, err
	}

	return &user, nil
}
