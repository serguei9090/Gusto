import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency } from '@/utils/currency';

interface ExchangeRates {
    [key: string]: number;
}

interface SettingsState {
    baseCurrency: Currency;
    exchangeRates: ExchangeRates;
    setBaseCurrency: (currency: Currency) => void;
    setExchangeRate: (currency: Currency, rate: number) => void;
    resetDefaults: () => void;
}

const DEFAULT_RATES: ExchangeRates = {
    USD: 1.0,
    EUR: 0.92, // Default: 1 USD = 0.92 EUR
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            baseCurrency: 'USD',
            exchangeRates: DEFAULT_RATES,
            setBaseCurrency: (currency) =>
                set((state) => ({ baseCurrency: currency })),
            setExchangeRate: (currency, rate) =>
                set((state) => ({
                    exchangeRates: {
                        ...state.exchangeRates,
                        [currency]: rate,
                    },
                })),
            resetDefaults: () =>
                set({
                    baseCurrency: 'USD',
                    exchangeRates: DEFAULT_RATES,
                }),
        }),
        {
            name: 'restaurant-settings-storage',
        }
    )
);
