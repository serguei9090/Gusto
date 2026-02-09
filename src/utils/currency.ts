/**
 * Currency utilities for multi-currency support
 * Supports USD and EUR with automatic conversion
 */

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "CUP"] as const;
export type Currency = string;

/**
 * Currency configuration with symbols and exchange rates
 * Rates are relative to USD (USD = 1.0)
 */
export const CURRENCIES: Record<
  string,
  { symbol: string; rate: number; name: string }
> = {
  USD: { symbol: "$", rate: 1.0, name: "US Dollar" },
  EUR: { symbol: "€", rate: 0.92, name: "Euro" },
  CUP: { symbol: "₱", rate: 24.0, name: "Cuban Peso" },
};

/**
 * Default currency for the application
 */
export const DEFAULT_CURRENCY: Currency = "USD";

/**
 * Convert amount from one currency to another
 *
 * @param amount - Amount to convert
 * @param from - Source currency
 * @param to - Target currency
 * @returns Converted amount
 *
 * @example
 * convertCurrency(100, 'USD', 'EUR') // Returns ~92
 * convertCurrency(50, 'EUR', 'USD') // Returns ~54.35
 */
/**
 * Convert amount from one currency to another
 *
 * @param amount - Amount to convert
 * @param from - Source currency
 * @param to - Target currency
 * @param rates - Optional map of exchange rates (relative to USD)
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates?: Record<string, number>,
): number {
  if (from === to) return amount;

  // Use provided rates or fall back to defaults (for tests/legacy)
  const getRate = (currency: string) => {
    if (currency === "USD") return 1.0;
    if (rates && typeof rates[currency] === "number") return rates[currency];
    return CURRENCIES[currency]?.rate || 1.0;
  };

  const fromRate = getRate(from);
  const toRate = getRate(to);

  // Convert to USD first (as base currency)
  const amountInUSD = amount / fromRate;

  // Then convert from USD to target currency
  return amountInUSD * toRate;
}

/**
 * Format amount with currency symbol
 *
 * @param amount - Amount to format
 * @param currency - Currency to use for formatting
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(100, 'USD') // Returns "$100.00"
 * formatCurrency(50.5, 'EUR') // Returns "€50.50"
 * formatCurrency(1000.123, 'USD', { decimals: 2 }) // Returns "$1,000.12"
 */
export function formatCurrency(
  amount: number,
  currency: string,
  options: { decimals?: number; showSymbol?: boolean } = {},
): string {
  const { decimals = 2, showSymbol = true } = options;
  const symbol = CURRENCIES[currency]?.symbol || currency;

  // Format number with decimals and thousand separators
  const formatted = amount
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return showSymbol ? `${symbol}${formatted}` : formatted;
}

/**
 * Parse currency string to number
 * Handles various formats: "$100", "100.50", "€50,00"
 *
 * @param value - Currency string to parse
 * @returns Parsed number value
 */
export function parseCurrencyString(value: string): number {
  // Remove currency symbols and thousand separators
  const cleaned = value.replace(/[$€,\s]/g, "");
  return Number.parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCIES[currency]?.symbol || currency;
}

/**
 * Get currency name for a given currency code
 */
export function getCurrencyName(currency: string): string {
  return CURRENCIES[currency]?.name || currency;
}

/**
 * Validate if a string is a valid currency code
 */
export function isValidCurrency(code: string): code is Currency {
  return typeof code === "string" && code.length === 3;
}
