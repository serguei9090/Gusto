import { invoke } from "@tauri-apps/api/core";
import { db } from "@/lib/db";
import type {
  CostBreakdown,
  RecipeFinancials,
  StandardCostInput,
  TaxRate,
} from "../types";

export class FinanceRepository {
  // --- Rust Integration ---
  async calculateRecipeCost(input: StandardCostInput): Promise<CostBreakdown> {
    return await invoke<CostBreakdown>("calculate_recipe_cost", { input });
  }

  // --- Tax Management ---
  async getTaxRates(): Promise<TaxRate[]> {
    return (await db
      .selectFrom("tax_rates")
      .selectAll()
      .execute()) as unknown as TaxRate[];
  }

  async createTaxRate(rate: Omit<TaxRate, "id">): Promise<TaxRate> {
    const result = await db
      .insertInto("tax_rates")
      .values({
        name: rate.name,
        rate: rate.rate,
        type: rate.type,
        is_active: rate.isActive ? 1 : 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      ...result,
      isActive: Boolean(result.is_active),
    } as unknown as TaxRate;
  }

  async updateTaxRate(id: number, rate: Partial<TaxRate>): Promise<void> {
    await db
      .updateTable("tax_rates")
      .set({
        name: rate.name,
        rate: rate.rate,
        type: rate.type,
        is_active:
          rate.isActive !== undefined ? (rate.isActive ? 1 : 0) : undefined,
      })
      .where("id", "=", id)
      .execute();
  }

  // --- Financial Cache ---
  async getRecipeFinancials(
    recipeId: number,
  ): Promise<RecipeFinancials | null> {
    const row = await db
      .selectFrom("recipe_financials")
      .selectAll()
      .where("recipe_id", "=", recipeId)
      .executeTakeFirst();

    if (!row) return null;

    return {
      recipeId: row.recipe_id,
      laborCost: row.labor_cost,
      variableOverhead: row.variable_overhead,
      fixedOverhead: row.fixed_overhead,
      primeCost: row.prime_cost,
      totalPlateCost: row.total_plate_cost,
      lastCalculatedAt: row.last_calculated_at,
    };
  }

  async saveRecipeFinancials(data: RecipeFinancials): Promise<void> {
    await db
      .insertInto("recipe_financials")
      .values({
        recipe_id: data.recipeId,
        labor_cost: data.laborCost,
        variable_overhead: data.variableOverhead,
        fixed_overhead: data.fixedOverhead,
        prime_cost: data.primeCost,
        total_plate_cost: data.totalPlateCost,
        last_calculated_at: data.lastCalculatedAt,
      })
      .onConflict((oc) =>
        oc.column("recipe_id").doUpdateSet({
          labor_cost: data.laborCost,
          variable_overhead: data.variableOverhead,
          fixed_overhead: data.fixedOverhead,
          prime_cost: data.primeCost,
          total_plate_cost: data.totalPlateCost,
          last_calculated_at: data.lastCalculatedAt,
        }),
      )
      .execute();
  }

  async getGlobalFinancialSettings() {
    const settings = await db
      .selectFrom("app_settings")
      .select(["key", "value"])
      .where("key", "in", [
        "labor_rate_hourly",
        "utility_burn_rate_min",
        "fixed_overhead_percent",
      ])
      .execute();

    const map = settings.reduce(
      (acc, s) => {
        acc[s.key] = parseFloat(s.value);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      laborRateHourly: map.labor_rate_hourly || 15.0,
      utilityBurnRateMin: map.utility_burn_rate_min || 0.05,
      fixedOverheadPercent: map.fixed_overhead_percent || 0.1,
    };
  }
}

export const financeRepository = new FinanceRepository();
