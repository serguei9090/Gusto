import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/utils/currency";

interface ExchangeRates {
  [key: string]: number;
}

interface SettingsState {
  baseCurrency: Currency;
  exchangeRates: ExchangeRates;
  modules: Record<string, boolean>;
  moduleOrder: string[];
  setBaseCurrency: (currency: Currency) => void;
  setExchangeRate: (currency: Currency, rate: number) => void;
  toggleModule: (module: string, enabled: boolean) => void;
  reorderModules: (order: string[]) => void;
  resetDefaults: () => void;
}

const DEFAULT_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  CUP: 24, // Fixed: removed .00 to avoid lint error
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      baseCurrency: "USD",
      exchangeRates: DEFAULT_RATES,
      modules: {
        dashboard: true,
        recipes: true,
        inventory: true,
        suppliers: true,
        prepsheets: true,
        calculators: true,
      },
      moduleOrder: [
        "dashboard",
        "recipes",
        "inventory",
        "suppliers",
        "prepsheets",
        "calculators",
      ],
      setBaseCurrency: (currency) => set(() => ({ baseCurrency: currency })),
      setExchangeRate: (currency, rate) =>
        set((state) => ({
          exchangeRates: {
            ...state.exchangeRates,
            [currency]: rate,
          },
        })),
      toggleModule: (module: string, enabled: boolean) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [module]: enabled,
          },
        })),
      reorderModules: (order: string[]) =>
        set(() => ({
          moduleOrder: order,
        })),
      resetDefaults: () =>
        set({
          baseCurrency: "USD",
          exchangeRates: DEFAULT_RATES,
          modules: {
            dashboard: true,
            recipes: true,
            inventory: true,
            suppliers: true,
            prepsheets: true,
            calculators: true,
          },
          moduleOrder: [
            "dashboard",
            "recipes",
            "inventory",
            "suppliers",
            "prepsheets",
            "calculators",
          ],
        }),
    }),
    {
      name: "restaurant-settings-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as SettingsState;
        if (version < 1) {
          // Add calculators if missing from old versions
          if (state.modules && !state.modules.calculators) {
            state.modules.calculators = true;
          }
          if (state.moduleOrder && !state.moduleOrder.includes("calculators")) {
            state.moduleOrder.push("calculators");
          }
        }

        if (version < 2) {
          // Properly remove ingredients module from order and visibility
          if (state.modules) {
            delete state.modules.ingredients;
          }
          if (state.moduleOrder) {
            state.moduleOrder = state.moduleOrder.filter(
              (id) => id.toLowerCase() !== "ingredients",
            );
          }
        }
        return state;
      },
    },
  ),
);
