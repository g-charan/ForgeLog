package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"forgelog/backend/internal/middleware"
)

type StashResponse struct {
	PaintIDs     []string          `json:"paint_ids"`
	CustomPaints []json.RawMessage `json:"custom_paints"`
}

func (h *Handlers) GetStash(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	query := `SELECT paint_ids, custom_paints FROM user_stash WHERE user_id = $1`
	
	var paintIDsBytes []byte
	var customPaintsBytes []byte
	err := h.DB.QueryRow(context.Background(), query, userID).Scan(&paintIDsBytes, &customPaintsBytes)
	
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"paint_ids": [], "custom_paints": []}`))
		return
	}

	resp := StashResponse{}
	if len(paintIDsBytes) > 0 {
		json.Unmarshal(paintIDsBytes, &resp.PaintIDs)
	}
	if len(customPaintsBytes) > 0 {
		json.Unmarshal(customPaintsBytes, &resp.CustomPaints)
	}

	if resp.PaintIDs == nil {
		resp.PaintIDs = []string{}
	}
	if resp.CustomPaints == nil {
		resp.CustomPaints = []json.RawMessage{}
	}

	json.NewEncoder(w).Encode(resp)
}

type UpdateStashRequest struct {
	PaintIDs     []string          `json:"paint_ids"`
	CustomPaints []json.RawMessage `json:"custom_paints"`
}

func (h *Handlers) UpdateStash(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req UpdateStashRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.PaintIDs == nil {
		req.PaintIDs = []string{}
	}
	if req.CustomPaints == nil {
		req.CustomPaints = []json.RawMessage{}
	}

	paintIDsBytes, _ := json.Marshal(req.PaintIDs)
	customPaintsBytes, _ := json.Marshal(req.CustomPaints)

	query := `
		INSERT INTO user_stash (user_id, paint_ids, custom_paints, updated_at)
		VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id) DO UPDATE 
		SET paint_ids = $2, custom_paints = $3, updated_at = CURRENT_TIMESTAMP
	`
	
	_, err := h.DB.Exec(context.Background(), query, userID, paintIDsBytes, customPaintsBytes)
	if err != nil {
		log.Printf("Error updating stash for user %s: %v", userID, err)
		http.Error(w, "Failed to update stash", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"success"}`))
}
