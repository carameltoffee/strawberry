package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis"
)

type VerificationCodeRepo struct {
	redis *redis.Client
}

func newRedisVerificationCodeRepo(redis *redis.Client) VerificationCode {
	return &VerificationCodeRepo{
		redis: redis,
	}
}

func (r *VerificationCodeRepo) SetCode(ctx context.Context, email, code string, ttl time.Duration) error {
	key := fmt.Sprintf("verify:%s", email)
	return r.redis.Set(key, code, ttl).Err()
}

func (r *VerificationCodeRepo) GetCode(ctx context.Context, email string) (string, error) {
	key := fmt.Sprintf("verify:%s", email)
	return r.redis.Get(key).Result()
}

func (r *VerificationCodeRepo) DeleteCode(ctx context.Context, email string) error {
	key := fmt.Sprintf("verify:%s", email)
	return r.redis.Del(key).Err()
}
