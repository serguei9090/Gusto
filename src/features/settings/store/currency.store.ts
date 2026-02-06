import { create } from "zustand";
import type { Currency, ExchangeRate } from "../services/currency.repository";
import { currencyRepository } from "../services/currency.repository";

interface CurrencyState {
  currencies: Currency[];
  exchangeRates: ExchangeRate[];
  baseCurrency: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCurrencies: () => Promise<void>;
  loadExchangeRates: () => Promise<void>;
  loadBaseCurrency: () => Promise<void>;
  setBaseCurrency: (currencyCode: string) => Promise<void>;
  updateExchangeRate: (
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    source?: string,
  ) => Promise<void>;
  addCurrency: (currency: Omit<Currency, "isActive">) => Promise<void>;
  toggleCurrencyStatus: (code: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currencies: [],
  exchangeRates: [],
  baseCurrency: "USD",
  isLoading: false,
  error: null,

  loadCurrencies: async () => {
    try {
      set({ isLoading: true, error: null });
      const currencies = await currencyRepository.getAllCurrencies();
      set({ currencies, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load currencies",
        isLoading: false,
      });
    }
  },

  loadExchangeRates: async () => {
    try {
      set({ isLoading: true, error: null });
      const exchangeRates = await currencyRepository.getAllExchangeRates();
      set({ exchangeRates, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load exchange rates",
        isLoading: false,
      });
    }
  },

  loadBaseCurrency: async () => {
    try {
      const baseCurrency = await currencyRepository.getBaseCurrency();
      set({ baseCurrency });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load base currency",
      });
    }
  },

  setBaseCurrency: async (currencyCode: string) => {
    try {
      set({ isLoading: true, error: null });
      await currencyRepository.setBaseCurrency(currencyCode);
      set({ baseCurrency: currencyCode, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to set base currency",
        isLoading: false,
      });
    }
  },

  updateExchangeRate: async (
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    source?: string,
  ) => {
    try {
      set({ isLoading: true, error: null });
      await currencyRepository.updateExchangeRate(
        fromCurrency,
        toCurrency,
        rate,
        source,
      );
      await get().loadExchangeRates();
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update exchange rate",
        isLoading: false,
      });
    }
  },

  addCurrency: async (currency: Omit<Currency, "isActive">) => {
    try {
      set({ isLoading: true, error: null });
      await currencyRepository.addCurrency(currency);
      await get().loadCurrencies();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to add currency",
        isLoading: false,
      });
    }
  },

  toggleCurrencyStatus: async (code: string) => {
    try {
      set({ isLoading: true, error: null });
      await currencyRepository.toggleCurrencyStatus(code);
      await get().loadCurrencies();
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle currency status",
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    await Promise.all([
      get().loadCurrencies(),
      get().loadExchangeRates(),
      get().loadBaseCurrency(),
    ]);
  },
}));
