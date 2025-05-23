package hasher

import (
    "testing"
)

func TestHashString_Deterministic(t *testing.T) {
    h := NewHasher()
    input := "example-key"

    hash1 := h.HashString(input)
    hash2 := h.HashString(input)

    if hash1 != hash2 {
        t.Errorf("Expected deterministic hash, got %s and %s", hash1, hash2)
    }
}

func TestHashString_Uniqueness(t *testing.T) {
    h := NewHasher()
    input1 := "foo"
    input2 := "bar"

    hash1 := h.HashString(input1)
    hash2 := h.HashString(input2)

    if hash1 == hash2 {
        t.Errorf("Expected different hashes, got same: %s", hash1)
    }
}

func TestHashString_Empty(t *testing.T) {
    h := NewHasher()
    hash := h.HashString("")
    if hash == "" {
        t.Error("Expected hash of empty string to not be empty")
    }
}

func BenchmarkHashString(b *testing.B) {
    h := NewHasher()
    for i := 0; i < b.N; i++ {
        h.HashString("benchmark-key")
    }
}
