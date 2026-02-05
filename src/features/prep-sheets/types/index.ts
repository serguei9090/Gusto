export interface PrepSheetItem {
  ingredientId: number;
  ingredientName: string;
  totalQuantity: number;
  unit: string;
  recipeBreakdown: {
    recipeName: string;
    qty: number;
  }[];
}

export interface PrepSheetRecipe {
  recipeId: number;
  recipeName: string;
  baseServings: number;
  requestedServings: number;
}

export interface PrepSheet {
  id?: number;
  name: string;
  date: string;
  shift?: "morning" | "evening" | null;
  prepCookName?: string;
  notes?: string;
  items: PrepSheetItem[];
  recipes: PrepSheetRecipe[];
  createdAt?: string;
}

export interface PrepSheetFormData {
  name: string;
  date: string;
  shift?: "morning" | "evening" | null;
  prepCookName?: string;
  notes?: string;
  recipeSelections: {
    recipeId: number;
    servings: number;
  }[];
}

export interface PrepSheetsTable {
  id: number;
  name: string;
  date: string;
  shift: string | null;
  prep_cook_name: string | null;
  notes: string | null;
  recipes_json: string; // Stored as JSON string
  items_json: string; // Stored as JSON string
  created_at: string;
}
