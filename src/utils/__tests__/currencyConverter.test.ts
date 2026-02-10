import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  currencyRepository,
  type ExchangeRate,
} from "@/modules/core/settings/services/currency.repository";
import {
  type CurrencyState,
  useCurrencyStore,
} from "@/modules/core/settings/store/currency.store";
import {
  calculateTotalWithConversions,
  convertCurrency,
  convertIngredientCosts,
  formatCurrencyAmount,
  getBaseCurrency,
} from "../currencyConverter";

// Mock the dependencies
vi.mock("@/modules/core/settings/services/currency.repository", () => ({
  currencyRepository: {
    getExchangeRate: vi.fn(),
  },
}));

vi.mock("@/modules/core/settings/store/currency.store", () => ({
  useCurrencyStore: {
    getState: vi.fn(),
  },
}));

describe("currencyConverter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("convertCurrency", () => {
    it("should return same amount when source and target currencies are the same", async () => {
      const result = await convertCurrency(100, "USD", "USD");
      expect(result).toEqual({
        converted: 100,
        rate: 1,
      });
      expect(currencyRepository.getExchangeRate).not.toHaveBeenCalled();
    });

    it("should use direct exchange rate when available", async () => {
      vi.mocked(currencyRepository.getExchangeRate).mockResolvedValueOnce({
        id: 1,
        fromCurrency: "EUR",
        toCurrency: "USD",
        rate: 1.1,
        effectiveDate: "2024-01-01",
      });

      const result = await convertCurrency(100, "EUR", "USD");
      expect(result.converted).toBeCloseTo(110);
      expect(result.rate).toBe(1.1);
      expect(currencyRepository.getExchangeRate).toHaveBeenCalledWith(
        "EUR",
        "USD",
      );
    });

    it("should use inverse exchange rate when available", async () => {
      // First call (direct) returns null
      vi.mocked(currencyRepository.getExchangeRate).mockResolvedValueOnce(null);
      // Second call (inverse) returns rate
      vi.mocked(currencyRepository.getExchangeRate).mockResolvedValueOnce({
        id: 2,
        fromCurrency: "USD",
        toCurrency: "EUR",
        rate: 0.8,
        effectiveDate: "2024-01-01",
      });

      const result = await convertCurrency(100, "EUR", "USD");
      expect(result.converted).toBeCloseTo(125); // 100 * (1/0.8)
      expect(result.rate).toBe(1.25);
      expect(currencyRepository.getExchangeRate).toHaveBeenCalledTimes(2);
      expect(currencyRepository.getExchangeRate).toHaveBeenNthCalledWith(
        1,
        "EUR",
        "USD",
      );
      expect(currencyRepository.getExchangeRate).toHaveBeenNthCalledWith(
        2,
        "USD",
        "EUR",
      );
    });

    it("should return original amount and error when no rate found", async () => {
      vi.mocked(currencyRepository.getExchangeRate).mockResolvedValue(null);

      const result = await convertCurrency(100, "GBP", "USD");
      expect(result).toEqual({
        converted: 100,
        rate: null,
        error: "No exchange rate found for GBP → USD",
      });
    });

    it("should handle repository errors", async () => {
      vi.mocked(currencyRepository.getExchangeRate).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await convertCurrency(100, "GBP", "USD");
      expect(result).toEqual({
        converted: 100,
        rate: null,
        error: "Conversion failed: Database error",
      });
    });
  });

  describe("convertIngredientCosts", () => {
    it("should convert multiple ingredients", async () => {
      vi.mocked(currencyRepository.getExchangeRate).mockResolvedValue({
        id: 1,
        fromCurrency: "EUR",
        toCurrency: "USD",
        rate: 1.1,
        effectiveDate: "2024-01-01",
      });

      const ingredients = [
        { amount: 10, currency: "EUR" },
        { amount: 20, currency: "USD" },
      ];

      const result = await convertIngredientCosts(ingredients, "USD");

      expect(result).toHaveLength(2);
      expect(result[0].convertedAmount).toBeCloseTo(11);
      expect(result[0].originalAmount).toBe(10);
      expect(result[0].originalCurrency).toBe("EUR");
      expect(result[0].baseCurrency).toBe("USD");
      expect(result[0].exchangeRate).toBe(1.1);
      expect(result[0].hasRate).toBe(true);

      expect(result[1]).toEqual({
        originalAmount: 20,
        originalCurrency: "USD",
        convertedAmount: 20,
        baseCurrency: "USD",
        exchangeRate: 1,
        hasRate: true,
      });
    });
  });

  describe("getBaseCurrency", () => {
    it("should return base currency from store", () => {
      vi.mocked(useCurrencyStore.getState).mockReturnValue({
        baseCurrency: "EUR",
        currencies: [],
      } as unknown as CurrencyState);

      expect(getBaseCurrency()).toBe("EUR");
    });

    it("should return USD as default", () => {
      vi.mocked(useCurrencyStore.getState).mockReturnValue({
        baseCurrency: "",
        currencies: [],
      } as unknown as CurrencyState);

      expect(getBaseCurrency()).toBe("USD");
    });
  });

  describe("formatCurrencyAmount", () => {
    it("should format with symbol when currency found", () => {
      vi.mocked(useCurrencyStore.getState).mockReturnValue({
        currencies: [{ code: "USD", symbol: "$", decimalPlaces: 2 }],
      } as unknown as CurrencyState);

      expect(formatCurrencyAmount(12.345, "USD")).toBe("$12.35");
    });

    it("should use fallback format when currency not found", () => {
      vi.mocked(useCurrencyStore.getState).mockReturnValue({
        currencies: [],
      } as unknown as CurrencyState);

      expect(formatCurrencyAmount(12.345, "GBP")).toBe("12.35 GBP");
    });
  });

  describe("calculateTotalWithConversions", () => {
    it("should calculate total and identify missing rates", async () => {
      vi.mocked(useCurrencyStore.getState).mockReturnValue({
        baseCurrency: "USD",
        currencies: [],
      } as unknown as CurrencyState);

      // EUR -> USD has rate, GBP -> USD does not
      vi.mocked(currencyRepository.getExchangeRate).mockImplementation(
        async (from) => {
          if (from === "EUR")
            return {
              id: 1,
              fromCurrency: "EUR",
              toCurrency: "USD",
              rate: 1.1,
              effectiveDate: "2024-01-01",
            } as unknown as ExchangeRate;
          return null;
        },
      );

      const items = [
        { amount: 10, currency: "EUR", name: "Item 1" },
        { amount: 20, currency: "USD", name: "Item 2" },
        { amount: 30, currency: "GBP", name: "Item 3" },
      ];

      const result = await calculateTotalWithConversions(items);

      expect(result.total).toBeCloseTo(11 + 20 + 30); // 11 (EUR) + 20 (USD) + 30 (GBP fallback)
      expect(result.missingRates).toEqual(["GBP → USD"]);
      expect(result.baseCurrency).toBe("USD");
      expect(result.conversions).toHaveLength(3);
    });
  });
});
