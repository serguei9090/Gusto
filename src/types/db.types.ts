import type { Generated } from "kysely";

export interface IngredientsTable {
  id: Generated<number>;
  name: string;
  category: string;
  unit_of_measure: string;
  current_price: number;
  price_per_unit: number;
  currency: string;
  supplier_id: number | null;
  min_stock_level: number | null;
  current_stock: number;
  last_updated: Generated<string>;
  notes: string | null;
}

export interface RecipesTable {
  id: Generated<number>;
  name: string;
  description: string | null;
  category: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cooking_instructions: string | null;
  selling_price: number | null;
  currency: string;
  target_cost_percentage: number | null;
  waste_buffer_percentage: number | null;
  total_cost: number | null;
  profit_margin: number | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface RecipeIngredientsTable {
  id: Generated<number>;
  recipe_id: number;
  ingredient_id: number;
  quantity: number;
  unit: string;
  cost: number | null;
  notes: string | null;
}

export interface InventoryTransactionsTable {
  id: Generated<number>;
  ingredient_id: number;
  transaction_type: string;
  quantity: number;
  cost_per_unit: number | null;
  total_cost: number | null;
  reference: string | null;
  notes: string | null;
  created_at: Generated<string>;
}

export interface SuppliersTable {
  id: Generated<number>;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  payment_terms: string | null;
  account_number: string | null;
  notes: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string> | null;
}

export interface PrepSheetsTable {
  id: Generated<number>;
  name: string;
  date: string;
  shift: string | null;
  prep_cook_name: string | null;
  notes: string | null;
  recipes_json: string;
  items_json: string;
  created_at: Generated<string>;
}

export interface Database {
  ingredients: IngredientsTable;
  recipes: RecipesTable;
  recipe_ingredients: RecipeIngredientsTable;
  inventory_transactions: InventoryTransactionsTable;
  suppliers: SuppliersTable;
  prep_sheets: PrepSheetsTable;
}
