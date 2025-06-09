package redis

import (
	"time"

	"github.com/go-redis/redis"
)

func New(addr, password string, db int) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	if err := rdb.Ping().Err(); err != nil {
		return nil, err
	}

	return rdb, nil
}
