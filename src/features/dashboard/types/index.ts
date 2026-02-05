export interface DashboardSummary {
  totalInventoryValue: number;
  lowStockCount: number;
  avgProfitMargin: number;
  recipeCount: number;
}

export interface UrgentReorderItem {
  id: number;
  name: string;
  currentStock: number;
  minStockLevel: number;
  deficit: number;
  unit: string;
}

export interface TopRecipeItem {
  id: number;
  name: string;
  selling_price: number;
  profit_margin: number;
}
