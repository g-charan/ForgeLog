package models

type Paint struct {
	Name         string `json:"name"`
	Brand        string `json:"brand"`
	PaintType    string `json:"paintType,omitempty"`
	ColorHex     string `json:"colorHex,omitempty"`
	AffiliateURL string `json:"affiliateUrl,omitempty"`
}

type Recipe struct {
	ID         string   `json:"id,omitempty"`
	UserID     string   `json:"userId,omitempty"`
	UnitName   string   `json:"unitName,omitempty"`
	Base       Paint    `json:"base"`
	Shade      Paint    `json:"shade"`
	Layers     []Paint  `json:"layers"`
	Highlight  Paint    `json:"highlight"`
	Optional   Paint    `json:"optional,omitempty"`
	Confidence int      `json:"confidence"`
	Tips       []string `json:"tips"`
}
