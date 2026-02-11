import type { Currency } from "@/utils/currency";

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
  isActive: boolean;
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
  isActive?: boolean;
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
  isActive?: boolean;
}
