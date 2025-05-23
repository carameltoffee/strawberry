-- +goose Up
-- +goose StatementBegin
CREATE TABLE users IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    average_rating FLOAT CHECK (average_rating >= 0 AND average_rating <= 5),
    specialization VARCHAR(100) DEFAULT 'user'
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE users IF EXISTS;
-- +goose StatementEnd
