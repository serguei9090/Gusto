import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/utils/currency';

interface ExchangeRates {
    [key: string]: number;
}

interface SettingsState {
    baseCurrency: Currency;
    exchangeRates: ExchangeRates;
    modules: {
        suppliers: boolean;
        prepSheets: boolean;
    };
    setBaseCurrency: (currency: Currency) => void;
    setExchangeRate: (currency: Currency, rate: number) => void;
    toggleModule: (module: 'suppliers' | 'prepSheets', enabled: boolean) => void;
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
                suppliers: true,
                prepSheets: true,
            } as any,
            setBaseCurrency: (currency) =>
                set(() => ({ baseCurrency: currency })),
            setExchangeRate: (currency, rate) =>
                set((state) => ({
                    exchangeRates: {
                        ...state.exchangeRates,
                        [currency]: rate,
                    },
                })),
            toggleModule: (module: 'suppliers' | 'prepSheets', enabled: boolean) =>
                set((state) => ({
                    modules: {
                        ...(state as any).modules,
                        [module]: enabled,
                    },
                })),
            resetDefaults: () =>
                set({
                    baseCurrency: 'USD',
                    exchangeRates: DEFAULT_RATES,
                    modules: {
                        suppliers: true,
                        prepSheets: true,
                    },
                }),
        }),
        {
            name: 'restaurant-settings-storage',
        }
    )
);
