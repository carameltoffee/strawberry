package models

import "time"

type Review struct {
	Id        int64     `json:"id"`
	UserId    int64     `json:"user_id"`
	MasterId  int64     `json:"master_id"`
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
