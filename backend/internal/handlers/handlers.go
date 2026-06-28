package handlers

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handlers struct {
	DB *pgxpool.Pool
}

func NewHandlers(db *pgxpool.Pool) *Handlers {
	return &Handlers{
		DB: db,
	}
}
