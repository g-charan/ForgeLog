package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"forgelog/backend/internal/models"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func GenerateRecipeFromImage(ctx context.Context, imageData []byte, mimeType string) (*models.Recipe, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	model.ResponseMIMEType = "application/json"
	
	prompt := `You are a miniature painting expert. Analyse the painted surface in this image. 
Return ONLY valid JSON matching exactly this format: 
{ 
  "base": {"name": "string", "brand": "string", "colorHex": "#HEXCODE"}, 
  "shade": {"name": "string", "brand": "string", "colorHex": "#HEXCODE"}, 
  "layers": [{"name": "string", "brand": "string", "colorHex": "#HEXCODE"}], 
  "highlight": {"name": "string", "brand": "string", "colorHex": "#HEXCODE"}, 
  "optional": {"name": "string", "brand": "string", "colorHex": "#HEXCODE"}, 
  "confidence": 85, 
  "tips": ["string"] 
}. 
Use only official Citadel or Vallejo colour names. Confidence is 0-100. Always provide a close approximate hex color code in colorHex.`

	format := strings.TrimPrefix(mimeType, "image/")
	resp, err := model.GenerateContent(ctx,
		genai.Text(prompt),
		genai.ImageData(format, imageData),
	)
	if err != nil {
		return nil, fmt.Errorf("gemini generation failed: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from gemini")
	}

	part := resp.Candidates[0].Content.Parts[0]
	text, ok := part.(genai.Text)
	if !ok {
		return nil, fmt.Errorf("expected text response from gemini")
	}

	// The text response should be a JSON string, but sometimes includes markdown code blocks
	jsonStr := strings.TrimSpace(string(text))
	if strings.HasPrefix(jsonStr, "```json") {
		jsonStr = strings.TrimPrefix(jsonStr, "```json")
		jsonStr = strings.TrimSuffix(jsonStr, "```")
	}

	var recipe models.Recipe
	if err := json.Unmarshal([]byte(jsonStr), &recipe); err != nil {
		log.Printf("Failed to unmarshal JSON from Gemini: %s", jsonStr)
		return nil, fmt.Errorf("failed to parse recipe json: %w", err)
	}

	return &recipe, nil
}
