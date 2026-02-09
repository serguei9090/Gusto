import type { Currency } from "@/utils/currency";

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
  currency: Currency;
  supplierId: number | null;
  minStockLevel: number | null;
  currentStock: number;
  lastUpdated: string;
  notes: string | null;
  purchaseUnit?: string | null;
  conversionRatio?: number | null;
  isActive: boolean;
}

export interface CreateIngredientInput {
  name: string;
  category: IngredientCategory;
  unitOfMeasure: UnitOfMeasure;
  currentPrice: number;
  pricePerUnit: number;
  currency?: Currency;
  supplierId?: number | null;
  minStockLevel?: number | null;
  currentStock?: number;
  notes?: string | null;
  purchaseUnit?: string | null;
  conversionRatio?: number | null;
  isActive?: boolean;
}

export interface UpdateIngredientInput {
  name?: string;
  category?: IngredientCategory;
  unitOfMeasure?: UnitOfMeasure;
  currentPrice?: number;
  pricePerUnit?: number;
  currency?: Currency;
  supplierId?: number | null;
  minStockLevel?: number | null;
  currentStock?: number;
  notes?: string | null;
  purchaseUnit?: string | null;
  conversionRatio?: number | null;
  isActive?: boolean;
}
