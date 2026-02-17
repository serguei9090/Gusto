import { createModuleStore } from "@/lib/store";
import { runWithHandling } from "@/utils/error-handler";
import { financeRepository } from "../services/finance.repository";
import type { CostBreakdown, StandardCostInput, TaxRate } from "../types";

interface FinanceState {
  // Data
  taxRates: TaxRate[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTaxRates: () => Promise<void>;
  addTaxRate: (rate: Omit<TaxRate, "id">) => Promise<void>;
  updateTaxRate: (id: number, rate: Partial<TaxRate>) => Promise<void>;

  // Calculation
  calculateCost: (input: StandardCostInput) => Promise<CostBreakdown>;
}

export const useFinanceStore = createModuleStore<FinanceState>(
  { name: "finance" },
  (set, get) => ({
    taxRates: [],
    isLoading: false,
    error: null,

    fetchTaxRates: async () => {
      set({ isLoading: true, error: null });
      await runWithHandling(
        "fetchTaxRates",
        async () => {
          const rates = await financeRepository.getTaxRates();
          set({ taxRates: rates, isLoading: false });
        },
        (err) => set({ error: String(err), isLoading: false }),
      );
    },

    addTaxRate: async (rate) => {
      set({ isLoading: true });
      await runWithHandling(
        "addTaxRate",
        async () => {
          await financeRepository.createTaxRate(rate);
          await get().fetchTaxRates();
        },
        (err) => set({ error: String(err), isLoading: false }),
      );
    },

    updateTaxRate: async (id, rate) => {
      set({ isLoading: true });
      await runWithHandling(
        "updateTaxRate",
        async () => {
          await financeRepository.updateTaxRate(id, rate);
          await get().fetchTaxRates();
        },
        (err) => set({ error: String(err), isLoading: false }),
      );
    },

    calculateCost: async (input) => {
      // access Rust engine directly
      return await financeRepository.calculateRecipeCost(input);
    },
  }),
);
