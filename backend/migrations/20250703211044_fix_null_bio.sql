-- +goose Up
-- +goose StatementBegin
UPDATE users SET bio = '' WHERE bio IS NULL;

ALTER TABLE users
    ALTER COLUMN bio SET DEFAULT '',
    ALTER COLUMN bio SET NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
    ALTER COLUMN bio DROP DEFAULT,
    ALTER COLUMN bio DROP NOT NULL;
-- +goose StatementEnd
