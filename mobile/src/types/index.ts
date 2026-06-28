export type PaintBrand = 'Citadel' | 'Vallejo' | 'Custom';
export type PaintType = 'Base' | 'Shade' | 'Layer' | 'Contrast' | 'Metallic' | 'Technical' | 'Dry' | 'Model Color' | 'Game Color' | 'Custom';

export interface Paint {
  id: string;
  name: string;
  brand: PaintBrand;
  paintType?: PaintType;
  colorHex?: string;
  affiliateUrl?: string;
}

export interface Recipe {
  id: string;
  unitName?: string;
  base: Paint;
  shade: Paint;
  layers: Paint[];
  highlight: Paint;
  optional?: Paint;
  confidence: number;
  tips: string[];
}

export interface StashState {
  ownedPaintIds: string[];
  customPaints: Paint[];
  addPaint: (id: string) => void;
  removePaint: (id: string) => void;
  hasPaint: (id: string) => boolean;
  addCustomPaint: (paint: Paint) => void;
  removeCustomPaint: (id: string) => void;
}

export interface RecipeState {
  recipes: Recipe[];
  saveRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
}
