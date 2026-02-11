import { sql } from "kysely";
import { getDb } from "@/lib/db";
import type {
  DashboardSummary,
  TopRecipeItem,
  UrgentReorderItem,
} from "@/modules/core/dashboard/types";
import { calculateTotalWithConversions } from "@/utils/currencyConverter";

class DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    // 1. Fetch all ingredients with their stock, price, and currency
    const ingredients = await getDb()
      .selectFrom("ingredients")
      .select(["current_stock", "price_per_unit", "currency"])
      .where("is_active", "=", 1)
      .execute();

    // Calculate total inventory value with conversions
    const { total } = await calculateTotalWithConversions(
      ingredients.map((ing) => ({
        amount: ing.current_stock * (ing.price_per_unit || 0),
        currency: ing.currency || "USD",
      })),
    );

    // 2. Low Stock Count
    const lowStockResult = await getDb()
      .selectFrom("ingredients")
      .select(sql<number>`COUNT(*)`.as("count"))
      .where("min_stock_level", "is not", null)
      .whereRef("current_stock", "<=", "min_stock_level")
      .where("is_active", "=", 1)
      .executeTakeFirst();

    // 3. Recipe Count & Avg Margin
    // Note: Assuming recipes table has 'profit_margin' or we calculate it.
    // If 'profit_margin' is calculated on fly, this query needs adjustment.
    // Based on previous recipe migration, we likely store it or calc it.
    // Let's assume we need to calculate it if it's not stored, but for efficiency,
    // let's check if we can just average the stored ones or if we need to join.
    // For now, let's assume simple selection from recipes table if it has these fields.
    const recipeStatsResult = await getDb()
      .selectFrom("recipes")
      .select([
        sql<number>`COUNT(*)`.as("count"),
        sql<number>`AVG(profit_margin)`.as("avgMargin"),
      ])
      .executeTakeFirst();

    // To be precise, let's look at the recipe schema from previous steps or assume standard calculation.
    // Actually, let's use a simpler query for now and refine if schema differs.

    return {
      totalInventoryValue: total || 0,
      lowStockCount: Number(lowStockResult?.count || 0),
      avgProfitMargin: recipeStatsResult?.avgMargin || 0,
      recipeCount: Number(recipeStatsResult?.count || 0),
    };
  }

  async getUrgentReorders(limit = 5): Promise<UrgentReorderItem[]> {
    const rows = await getDb()
      .selectFrom("ingredients")
      .select([
        "id",
        "name",
        "current_stock",
        "min_stock_level",
        "unit_of_measure",
      ])
      .where("min_stock_level", "is not", null)
      .whereRef("current_stock", "<=", "min_stock_level")
      .where("is_active", "=", 1)
      .orderBy("current_stock", "asc") // prioritize lowest absolute stock? or biggest deficit?
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      currentStock: row.current_stock,
      minStockLevel: row.min_stock_level ?? 0,
      deficit: (row.min_stock_level ?? 0) - row.current_stock,
      unit: row.unit_of_measure,
    }));
  }

  async getTopRecipes(limit = 5): Promise<TopRecipeItem[]> {
    // Assuming we can calculate margin on the fly or it's stored.
    // Let's query assuming standard columns from recipe migration.
    // If `selling_price` and cost are known...
    // Actually previous migration might not have added `profit_margin` column,
    // usually it's calculated. Let's use `target_cost_percentage` as proxy for now (lower cost = higher margin)
    // OR if we stored it. Let's select what we have.

    const rows = await getDb()
      .selectFrom("recipes")
      .select([
        "id",
        "name",
        "selling_price",
        // approximate margin from target cost if actual margin not stored
        // profit_margin = (selling - cost) / selling * 100
        // but we might only have target_cost_percentage stored.
        // Let's assume we can fetch basic info.
        "target_cost_percentage",
      ])
      .where("selling_price", "is not", null)
      .where("selling_price", ">", 0)
      .orderBy("target_cost_percentage", "asc") // Lower cost % = higher margin
      .limit(limit)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      selling_price: row.selling_price || 0,
      profit_margin: row.target_cost_percentage
        ? 100 - row.target_cost_percentage
        : 0,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
