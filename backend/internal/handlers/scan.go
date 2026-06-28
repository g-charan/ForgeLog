package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"forgelog/backend/internal/services"
)

func (h *Handlers) ScanImage(w http.ResponseWriter, r *http.Request) {
	// Restrict file size (e.g. 32MB)
	r.Body = http.MaxBytesReader(w, r.Body, 32<<20)

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, "Image too large or invalid form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Image file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	imageData, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read image", http.StatusInternalServerError)
		return
	}

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "image/jpeg"
	}

	recipe, err := services.GenerateRecipeFromImage(r.Context(), imageData, mimeType)
	if err != nil {
		log.Printf("Error generating recipe: %v", err)
		http.Error(w, fmt.Sprintf("Failed to generate recipe: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(recipe)
}
