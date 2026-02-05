// Ingredient Types
export type IngredientCategory =
  | "protein"
  | "vegetable"
  | "dairy"
  | "spice"
  | "grain"
  | "fruit"
  | "condiment"
  | "other";

export type UnitOfMeasure =
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "piece"
  | "cup"
  | "tbsp"
  | "tsp";

export interface Ingredient {
  id: number;
  name: string;
  category: IngredientCategory;
  unitOfMeasure: UnitOfMeasure;
  currentPrice: number;
  pricePerUnit: number;
  supplierId: number | null;
  minStockLevel: number | null;
  currentStock: number;
  lastUpdated: string;
  notes: string | null;
}

export interface CreateIngredientInput {
  name: string;
  category: IngredientCategory;
  unitOfMeasure: UnitOfMeasure;
  currentPrice: number;
  pricePerUnit: number;
  supplierId?: number | null;
  minStockLevel?: number | null;
  currentStock?: number;
  notes?: string | null;
}

export interface UpdateIngredientInput {
  name?: string;
  category?: IngredientCategory;
  unitOfMeasure?: UnitOfMeasure;
  currentPrice?: number;
  pricePerUnit?: number;
  supplierId?: number | null;
  minStockLevel?: number | null;
  currentStock?: number;
  notes?: string | null;
}

// Supplier Types
export interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  paymentTerms: string | null;
  notes: string | null;
  createdAt: string;
}

// Recipe Types
export type RecipeCategory =
  | "appetizer"
  | "main"
  | "dessert"
  | "beverage"
  | "side"
  | "other";

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  category: RecipeCategory | null;
  servings: number;
  prepTimeMinutes: number | null;
  cookingInstructions: string | null;
  sellingPrice: number | null;
  targetCostPercentage: number | null;
  totalCost: number | null;
  profitMargin: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  category?: RecipeCategory | null;
  servings: number;
  prepTimeMinutes?: number | null;
  cookingInstructions?: string | null;
  sellingPrice?: number | null;
  targetCostPercentage?: number | null;
}

export interface UpdateRecipeInput {
  name?: string;
  description?: string | null;
  category?: RecipeCategory | null;
  servings?: number;
  prepTimeMinutes?: number | null;
  cookingInstructions?: string | null;
  sellingPrice?: number | null;
  targetCostPercentage?: number | null;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredientName: string;
    currentPricePerUnit: number; // For real-time cost comparison
    ingredientUnit: UnitOfMeasure; // Base unit of the ingredient
  })[];
}

// Recipe Ingredient Types
export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
  unit: string; // The unit used in the recipe (e.g. "g" vs "kg")
  cost: number | null; // Calculated cost snapshot
  notes: string | null;
}

// Inventory Transaction Types
export type TransactionType = "purchase" | "usage" | "adjustment" | "waste";

export interface InventoryTransaction {
  id: number;
  ingredientId: number;
  transactionType: TransactionType;
  quantity: number;
  costPerUnit: number | null;
  totalCost: number | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

// Price History Types
export interface PriceHistory {
  id: number;
  ingredientId: number;
  price: number;
  supplierId: number | null;
  recordedAt: string;
}
