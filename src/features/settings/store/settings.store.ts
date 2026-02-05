import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/utils/currency';

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
    USD: 1.0,
    EUR: 0.92, // Default: 1 USD = 0.92 EUR
    CUP: 24.0, // Default: 1 USD = 24.00 CUP (Approx)
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            baseCurrency: 'USD',
            exchangeRates: DEFAULT_RATES,
            modules: {
                dashboard: true,
                ingredients: true,
                recipes: true,
                inventory: true,
                suppliers: true,
                prepSheets: true,
            },
            moduleOrder: [
                "dashboard",
                "ingredients",
                "recipes",
                "inventory",
                "suppliers",
                "prepSheets",
            ],
            setBaseCurrency: (currency) =>
                set(() => ({ baseCurrency: currency })),
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
                    baseCurrency: 'USD',
                    exchangeRates: DEFAULT_RATES,
                    modules: {
                        dashboard: true,
                        ingredients: true,
                        recipes: true,
                        inventory: true,
                        suppliers: true,
                        prepSheets: true,
                    },
                    moduleOrder: [
                        "dashboard",
                        "ingredients",
                        "recipes",
                        "inventory",
                        "suppliers",
                        "prepSheets",
                    ],
                }),
        }),
        {
            name: 'restaurant-settings-storage',
        }
    )
);
