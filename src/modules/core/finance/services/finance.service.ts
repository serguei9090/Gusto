import { invoke } from "@tauri-apps/api/core";
import type { CostBreakdown, StandardCostInput } from "../types";

// Helper to safely parse decimal strings from Rust
const toNum = (val: string | number | undefined): number => {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val);
  return 0;
};

export const financeService = {
  calculateStandardCost: async (
    input: StandardCostInput,
  ): Promise<CostBreakdown> => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Rust returns strings for Decimals, we need to cast
      const raw = await invoke<any>("calculate_standard_cost", { input });
      return {
        raw_materials: toNum(raw.raw_materials),
        direct_labor: toNum(raw.direct_labor),
        labor_taxes: toNum(raw.labor_taxes),
        prime_cost: toNum(raw.prime_cost),
        variable_overhead: toNum(raw.variable_overhead),
        fixed_overhead: toNum(raw.fixed_overhead),
        total_cost_of_goods: toNum(raw.total_cost_of_goods),
        fully_loaded_cost: toNum(raw.fully_loaded_cost),
      };
    } catch (error) {
      console.error("Failed to calculate standard cost:", error);
      throw error;
    }
  },
};
