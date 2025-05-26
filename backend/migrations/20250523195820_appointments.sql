-- +goose Up
-- +goose StatementBegin
CREATE TABLE appointments IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    master_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE appointments IF EXISTS;
-- +goose StatementEnd
