package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"forgelog/backend/internal/handlers"
	"forgelog/backend/internal/middleware"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables if running locally
	_ = godotenv.Load()

	// Initialize DB connection pool
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer pool.Close()

	// JWKS initialization removed as we now use direct DB session lookup

	// Initialize Handlers
	initDB(pool)
	h := handlers.NewHandlers(pool)

	// Set up router using standard mux
	mux := http.NewServeMux()

	// Health check (public)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Protected routes
	authMux := http.NewServeMux()
	
	// Scan image (calls Gemini)
	authMux.HandleFunc("POST /scan", h.ScanImage)
	
	// Recipes CRUD
	authMux.HandleFunc("GET /recipes", h.GetRecipes)
	authMux.HandleFunc("POST /recipes", h.CreateRecipe)
	authMux.HandleFunc("PUT /recipes/{id}", h.UpdateRecipe)
	authMux.HandleFunc("DELETE /recipes/{id}", h.DeleteRecipe)

	// Stash CRUD
	authMux.HandleFunc("GET /stash", h.GetStash)
	authMux.HandleFunc("PUT /stash", h.UpdateStash)

	// Mount protected routes under /api
	mux.Handle("/api/", http.StripPrefix("/api", middleware.AuthMiddleware(pool)(authMux)))

	// Cors and request logging middleware
	handler := middleware.CorsMiddleware(middleware.LoggingMiddleware(mux))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func initDB(pool *pgxpool.Pool) {
	query := `
		CREATE TABLE IF NOT EXISTS recipes (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id TEXT NOT NULL,
			unit_name TEXT,
			base JSONB,
			shade JSONB,
			layers JSONB,
			highlight JSONB,
			optional JSONB,
			confidence INT,
			tips JSONB,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS user_stash (
			user_id TEXT PRIMARY KEY,
			paint_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
			custom_paints JSONB NOT NULL DEFAULT '[]'::jsonb,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE user_stash ADD COLUMN IF NOT EXISTS custom_paints JSONB NOT NULL DEFAULT '[]'::jsonb;
	`
	_, err := pool.Exec(context.Background(), query)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
}
