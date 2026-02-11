import { currencyRepository } from "@/modules/core/settings/services/currency.repository";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

export interface ConversionResult {
  converted: number;
  rate: number | null;
  error?: string;
}

export interface IngredientConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  baseCurrency: string;
  exchangeRate: number | null;
  hasRate: boolean;
}

/**
 * Convert an amount from one currency to another using exchange rates
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<ConversionResult> {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      converted: amount,
      rate: 1,
    };
  }

  try {
    // Try to get direct exchange rate (FROM -> TO)
    const directRate = await currencyRepository.getExchangeRate(
      fromCurrency,
      toCurrency,
    );

    if (directRate) {
      return {
        converted: amount * directRate.rate,
        rate: directRate.rate,
      };
    }

    // Try inverse rate (TO -> FROM) and calculate
    const [searchFrom, searchTo] = [toCurrency, fromCurrency];
    const inverseRate = await currencyRepository.getExchangeRate(
      searchFrom,
      searchTo,
    );

    if (inverseRate && inverseRate.rate !== 0) {
      const calculatedRate = 1 / inverseRate.rate;
      return {
        converted: amount * calculatedRate,
        rate: calculatedRate,
      };
    }

    // No rate found
    return {
      converted: amount, // Return original amount as fallback
      rate: null,
      error: `No exchange rate found for ${fromCurrency} → ${toCurrency}`,
    };
  } catch (error) {
    console.error("Currency conversion error:", error);
    return {
      converted: amount,
      rate: null,
      error: `Conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Convert multiple ingredient costs to base currency
 */
export async function convertIngredientCosts(
  ingredients: Array<{
    amount: number;
    currency: string;
    name?: string;
  }>,
  baseCurrency: string,
): Promise<IngredientConversion[]> {
  const conversions = await Promise.all(
    ingredients.map(async (ingredient) => {
      const result = await convertCurrency(
        ingredient.amount,
        ingredient.currency,
        baseCurrency,
      );

      return {
        originalAmount: ingredient.amount,
        originalCurrency: ingredient.currency,
        convertedAmount: result.converted,
        baseCurrency,
        exchangeRate: result.rate,
        hasRate: result.rate !== null,
      };
    }),
  );

  return conversions;
}

/**
 * Get base currency from store or default to USD
 */
export function getBaseCurrency(): string {
  const { baseCurrency } = useCurrencyStore.getState();
  return baseCurrency || "USD";
}

/**
 * Format currency amount with symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
): string {
  const { currencies } = useCurrencyStore.getState();
  const currency = currencies.find((c) => c.code === currencyCode);

  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`;
}

/**
 * Calculate total cost with currency conversions
 */
export async function calculateTotalWithConversions(
  items: Array<{
    amount: number;
    currency: string;
    name?: string;
  }>,
): Promise<{
  total: number;
  baseCurrency: string;
  conversions: IngredientConversion[];
  missingRates: string[];
}> {
  const baseCurrency = getBaseCurrency();
  const conversions = await convertIngredientCosts(items, baseCurrency);

  const total = conversions.reduce(
    (sum, conv) => sum + conv.convertedAmount,
    0,
  );

  const missingRates = conversions
    .filter((conv) => !conv.hasRate && conv.originalCurrency !== baseCurrency)
    .map((conv) => `${conv.originalCurrency} → ${baseCurrency}`);

  return {
    total,
    baseCurrency,
    conversions,
    missingRates,
  };
}
