package hasher

import (
	"crypto/sha256"
	"encoding/hex"
	"hash"
	"sync"
)

type Hasher struct {
	pool sync.Pool
}

func New() *Hasher {
	return &Hasher{
		pool: sync.Pool{
			New: func() interface{} {
				return sha256.New()
			},
		},
	}
}

func (h *Hasher) HashString(s string) string {
	hasher := h.pool.Get().(hash.Hash)
	hasher.Reset()
	hasher.Write([]byte(s))
	sum := hasher.Sum(nil)
	h.pool.Put(hasher)
	return hex.EncodeToString(sum)
}
