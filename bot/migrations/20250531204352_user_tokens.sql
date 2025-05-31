-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS user_tokens (
    user_id INTEGER PRIMARY KEY,
    token TEXT NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP IF EXISTS user_tokens;
-- +goose StatementEnd
