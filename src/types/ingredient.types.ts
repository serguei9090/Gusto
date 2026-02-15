import type { Currency } from "@/utils/currency";
// Ingredient Types
// Ingredient Types
// (Removed redundant IngredientCategory and UnitOfMeasure type aliases)

export interface Ingredient {
  id: number;
  name: string;
  category: string;
  unitOfMeasure: string;
  currentPrice: number;
  pricePerUnit: number;
  currency: Currency;
  supplierId: number | null;
  minStockLevel: number | null;
  currentStock: number;
  lastUpdated: string;
  notes: string | null;
  purchaseUnit?: string | null;
  conversionRatio?: number | null;
}

export interface CreateIngredientInput {
  name: string;
  category: string;
  unitOfMeasure: string;
  currentPrice: number;
  pricePerUnit: number;
  currency?: Currency;
  supplierId?: number | null;
  minStockLevel?: number | null;
  currentStock?: number;
  notes?: string | null;
  purchaseUnit?: string | null;
  conversionRatio?: number | null;
}

export interface UpdateIngredientInput {
  name?: string;
  category?: string;
  unitOfMeasure?: string;
  currentPrice?: number;
  pricePerUnit?: number;
  currency?: Currency;
  supplierId?: number | null;
  minStockLevel?: number | null;
  currentStock?: number;
  notes?: string | null;
  purchaseUnit?: string | null;
  conversionRatio?: number | null;
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
  accountNumber: string | null;
  notes: string | null;
  createdAt: string;
}

// Recipe Types
// (Removed redundant RecipeCategory type alias)

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  servings: number;
  yieldAmount?: number | null;
  yieldUnit?: string | null;
  prepTimeMinutes: number | null;
  cookingInstructions: string | null;
  sellingPrice: number | null;
  currency: Currency;
  targetCostPercentage: number | null;
  wasteBufferPercentage: number | null;
  totalCost: number | null;
  profitMargin: number | null;
  createdAt: string;
  updatedAt: string;
  isExperiment?: boolean;
  parentRecipeId?: number;
  experimentName?: string;
  allergens?: string[];
  dietaryRestrictions?: string[];
  calories?: number | null;
  isBaseRecipe?: boolean;
}

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  category?: string | null;
  servings: number;
  yieldAmount?: number | null;
  yieldUnit?: string | null;
  prepTimeMinutes?: number | null;
  cookingInstructions?: string | null;
  sellingPrice?: number | null;
  targetCostPercentage?: number | null;
  wasteBufferPercentage?: number | null;
  allergens?: string[];
  dietaryRestrictions?: string[];
  calories?: number | null;
  isBaseRecipe?: boolean;
}

export interface UpdateRecipeInput {
  name?: string;
  description?: string | null;
  category?: string | null;
  servings?: number;
  yieldAmount?: number | null;
  yieldUnit?: string | null;
  prepTimeMinutes?: number | null;
  cookingInstructions?: string | null;
  sellingPrice?: number | null;
  targetCostPercentage?: number | null;
  wasteBufferPercentage?: number | null;
  changeNotes?: string;
  ingredients?: {
    ingredientId: number | null;
    subRecipeId?: number | null;
    quantity: number;
    unit: string;
  }[];
  allergens?: string[];
  dietaryRestrictions?: string[];
  calories?: number | null;
  isBaseRecipe?: boolean;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredientName: string;
    currentPricePerUnit: number; // For real-time cost comparison
    ingredientUnit: string; // Base unit of the ingredient/recipe
    currency: string;
    isSubRecipe?: boolean;
  })[];
}

// Recipe Ingredient Types
export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number | null;
  subRecipeId: number | null;
  quantity: number;
  unit: string; // The unit used in the recipe
  cost: number | null; // Calculated cost snapshot
  notes: string | null;
}

// Inventory Transaction Types
export type TransactionType = "purchase" | "usage" | "adjustment" | "waste";

export interface CreateTransactionInput {
  ingredientId: number;
  transactionType: TransactionType;
  quantity: number;
  costPerUnit: number | null;
  totalCost: number | null;
  currency?: string | null;
  reference: string | null;
  notes: string | null;
}

export interface CreateTransactionResult {
  transaction: InventoryTransaction;
  updatedIngredient: Ingredient;
}

export interface InventoryTransaction {
  id: number;
  ingredientId?: number | null;
  assetId?: number | null;
  itemType?: "ingredient" | "asset";
  transactionType: TransactionType;
  quantity: number;
  costPerUnit: number | null;
  totalCost: number | null;
  currency?: string | null;
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
