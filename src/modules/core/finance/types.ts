export interface TaxRate {
  id: number;
  name: string;
  rate: number; // 0.10 for 10%
  type: "VAT" | "GST" | "SERVICE" | "LUXURY" | "OTHER";
  isActive: boolean;
}

export interface ExpenseItem {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: "RENT" | "UTILITY" | "ADMIN" | "LABOR" | "MARKETING" | "OTHER";
  referenceNumber?: string;
  isRecurring: boolean;
  frequency?: "MONTHLY" | "WEEKLY";
}

// --- Legacy Types ---
export interface LegacyCostBreakdown {
  rm: number; // Raw Materials
  dl: number; // Direct Labor
  vo: number; // Variable Overhead
  fo: number; // Fixed Overhead
  prime_cost: number; // RM + DL
  total_cost: number; // (Prime + VO) * (1 + FO)
}

export interface IngredientInput {
  quantity: number;
  cost_per_unit: number;
  yield_percent?: number;
}

export interface LegacyCostInput {
  ingredients: IngredientInput[];
  labor_rate_hourly: number;
  prep_time_minutes: number;
  utility_burn_rate_min: number;
  fixed_overhead_percent: number;
  waste_buffer_percent: number;
}

// --- Standard Types ---

export interface CostBreakdown {
  raw_materials: number;
  direct_labor: number;
  labor_taxes: number;
  prime_cost: number; // RM + DL
  variable_overhead: number; // Production Utilities etc.
  fixed_overhead: number; // Rent, Admin etc.
  total_cost_of_goods: number; // Prime + VO (Factory Cost)
  fully_loaded_cost: number; // TCOG + FO + Taxes
}

export interface LaborStep {
  name: string;
  workers: number;
  time_minutes: number;
  hourly_rate: number;
  is_production: boolean;
  labor_rate_id?: number; // Link to centralized rate
}

export interface OverheadSettings {
  variable_overhead_rate: number;
  fixed_overhead_buffer: number;
  labor_tax_rates: number[];
}

export interface StandardCostInput {
  ingredients: IngredientInput[];
  labor_steps: LaborStep[];
  overheads: OverheadSettings;
  waste_buffer_percent?: number;
}

import type { RecipeFinancials } from "@/types/ingredient.types";
export type { RecipeFinancials };
