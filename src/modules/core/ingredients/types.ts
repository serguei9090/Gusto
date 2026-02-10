import type { Currency } from "@/utils/currency";

export type IngredientCategory = string;
export type UnitOfMeasure = string;

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
