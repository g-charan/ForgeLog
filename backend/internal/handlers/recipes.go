package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"forgelog/backend/internal/middleware"
	"forgelog/backend/internal/models"
)

func (h *Handlers) GetRecipes(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	rows, err := h.DB.Query(r.Context(), `
		SELECT id, user_id, unit_name, base, shade, layers, highlight, optional, confidence, tips 
		FROM recipes WHERE user_id = $1 ORDER BY created_at DESC
	`, userID)
	if err != nil {
		log.Printf("GetRecipes err: %v", err)
		http.Error(w, "Failed to fetch recipes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var recipes []models.Recipe
	for rows.Next() {
		var recipe models.Recipe
		var base, shade, layers, highlight, optional, tips []byte
		
		err := rows.Scan(
			&recipe.ID,
			&recipe.UserID,
			&recipe.UnitName,
			&base,
			&shade,
			&layers,
			&highlight,
			&optional,
			&recipe.Confidence,
			&tips,
		)
		if err != nil {
			log.Printf("Row scan err: %v", err)
			continue
		}

		// Unmarshal JSONB fields
		if len(base) > 0 { _ = json.Unmarshal(base, &recipe.Base) }
		if len(shade) > 0 { _ = json.Unmarshal(shade, &recipe.Shade) }
		if len(layers) > 0 { _ = json.Unmarshal(layers, &recipe.Layers) }
		if len(highlight) > 0 { _ = json.Unmarshal(highlight, &recipe.Highlight) }
		if len(optional) > 0 { _ = json.Unmarshal(optional, &recipe.Optional) }
		if len(tips) > 0 { _ = json.Unmarshal(tips, &recipe.Tips) }

		recipes = append(recipes, recipe)
	}

	if recipes == nil {
		recipes = []models.Recipe{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(recipes)
}

func (h *Handlers) CreateRecipe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req models.Recipe
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	base, _ := json.Marshal(req.Base)
	shade, _ := json.Marshal(req.Shade)
	layers, _ := json.Marshal(req.Layers)
	highlight, _ := json.Marshal(req.Highlight)
	optional, _ := json.Marshal(req.Optional)
	tips, _ := json.Marshal(req.Tips)

	var insertedID string
	err := h.DB.QueryRow(r.Context(), `
		INSERT INTO recipes (user_id, unit_name, base, shade, layers, highlight, optional, confidence, tips)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`, userID, req.UnitName, string(base), string(shade), string(layers), string(highlight), string(optional), req.Confidence, string(tips)).Scan(&insertedID)
	
	if err != nil {
		log.Printf("CreateRecipe err: %v", err)
		http.Error(w, "Failed to create recipe", http.StatusInternalServerError)
		return
	}

	req.ID = insertedID
	req.UserID = userID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func (h *Handlers) UpdateRecipe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	recipeID := r.PathValue("id")

	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Dynamic update based on provided fields (simple version focusing on unitName)
	if unitName, ok := updates["unitName"].(string); ok {
		_, err := h.DB.Exec(r.Context(), `
			UPDATE recipes SET unit_name = $1, updated_at = CURRENT_TIMESTAMP
			WHERE id = $2 AND user_id = $3
		`, unitName, recipeID, userID)
		if err != nil {
			log.Printf("UpdateRecipe err: %v", err)
			http.Error(w, "Failed to update recipe", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"updated"}`))
}

func (h *Handlers) DeleteRecipe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	recipeID := r.PathValue("id")

	_, err := h.DB.Exec(r.Context(), `
		DELETE FROM recipes WHERE id = $1 AND user_id = $2
	`, recipeID, userID)
	if err != nil {
		log.Printf("DeleteRecipe err: %v", err)
		http.Error(w, "Failed to delete recipe", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
