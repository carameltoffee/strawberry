package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strawberry/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type reviewsRepo struct {
	db *pgxpool.Pool
}

var (
	ErrNotFound         = errors.New("resource not found")
	ErrConflict         = errors.New("resource already exists")
	ErrInvalidReference = errors.New("invalid foreign key reference")
)

func newPostgresReviewsRepo(db *pgxpool.Pool) Reviews {
	return &reviewsRepo{db: db}
}

func (r *reviewsRepo) Create(ctx context.Context, rev *models.Review) error {
	query := `
		INSERT INTO reviews (user_id, master_id, rating, comment, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query, rev.UserId, rev.MasterId, rev.Rating, rev.Comment).
		Scan(&rev.Id, &rev.CreatedAt, &rev.UpdatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				return ErrConflict
			case "23503":
				return ErrInvalidReference
			}
		}
		return err
	}

	return nil
}

func (r *reviewsRepo) GetById(ctx context.Context, id int64) (*models.Review, error) {
	query := `
		SELECT id, user_id, master_id, rating, comment, created_at, updated_at
		FROM reviews
		WHERE id = $1
	`
	var rev models.Review
	err := r.db.QueryRow(ctx, query, id).Scan(
		&rev.Id, &rev.UserId, &rev.MasterId, &rev.Rating, &rev.Comment,
		&rev.CreatedAt, &rev.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &rev, nil
}

func (r *reviewsRepo) GetByMasterId(ctx context.Context, masterId int64) ([]models.Review, error) {
	query := `
		SELECT id, user_id, master_id, rating, comment, created_at, updated_at
		FROM reviews
		WHERE master_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, masterId)
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews for master: %w", err)
	}
	defer rows.Close()

	var reviews []models.Review
	for rows.Next() {
		var rev models.Review
		if err := rows.Scan(&rev.Id, &rev.UserId, &rev.MasterId, &rev.Rating, &rev.Comment, &rev.CreatedAt, &rev.UpdatedAt); err != nil {
			return nil, err
		}
		reviews = append(reviews, rev)
	}

	return reviews, nil
}

func (r *reviewsRepo) Update(ctx context.Context, rev *models.Review) error {
	query := `
		UPDATE reviews
		SET rating = $1, comment = $2, updated_at = NOW()
		WHERE id = $3
	`
	cmd, err := r.db.Exec(ctx, query, rev.Rating, rev.Comment, rev.Id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *reviewsRepo) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM reviews WHERE id = $1`
	cmd, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *reviewsRepo) AverageRatingOfMaster(ctx context.Context, masterId int64) (float64, error) {
	var avg sql.NullFloat64

	err := r.db.QueryRow(ctx, `
        SELECT AVG(rating) FROM reviews WHERE master_id = $1
    `, masterId).Scan(&avg)
	if err != nil {
		return 0, err
	}

	if avg.Valid {
		return avg.Float64, nil
	}
	return 0, nil
}
