import type { Currency } from "@/utils/currency";

/**
 * Asset Types for Non-Food Inventory Items
 * (e.g., utensils, plates, equipment, operational materials)
 */

export type AssetType = "operational" | "equipment" | "disposable";

export interface Asset {
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
  assetType: AssetType;
}

export interface CreateAssetInput {
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
  assetType?: AssetType;
}

export interface UpdateAssetInput {
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
  assetType?: AssetType;
}

// Asset Transaction Types (extends inventory transaction)
export interface AssetTransaction {
  id: number;
  assetId: number;
  transactionType: "purchase" | "usage" | "waste" | "adjustment";
  quantity: number;
  costPerUnit: number | null;
  totalCost: number | null;
  currency?: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}
