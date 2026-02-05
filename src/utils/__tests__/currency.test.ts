import { describe, expect, it } from "vitest";
import {
    convertCurrency,
    formatCurrency,
    parseCurrencyString,
    getCurrencySymbol,
    getCurrencyName,
    isValidCurrency,
    CURRENCIES,
    type Currency,
} from "../currency";

describe("Currency Utilities", () => {
    describe("convertCurrency", () => {
        it("should return same amount for same currency", () => {
            expect(convertCurrency(100, "USD", "USD")).toBe(100);
            expect(convertCurrency(50, "EUR", "EUR")).toBe(50);
        });

        it("should convert USD to EUR", () => {
            const result = convertCurrency(100, "USD", "EUR");
            expect(result).toBeCloseTo(92, 1);
        });

        it("should convert EUR to USD", () => {
            const result = convertCurrency(92, "EUR", "USD");
            expect(result).toBeCloseTo(100, 1);
        });

        it("should handle decimal amounts", () => {
            const result = convertCurrency(10.50, "USD", "EUR");
            expect(result).toBeCloseTo(9.66, 2);
        });

        it("should be reversible", () => {
            const original = 100;
            const converted = convertCurrency(original, "USD", "EUR");
            const backToOriginal = convertCurrency(converted, "EUR", "USD");
            expect(backToOriginal).toBeCloseTo(original, 1);
        });
    });

    describe("formatCurrency", () => {
        it("should format USD with symbol", () => {
            expect(formatCurrency(100, "USD")).toBe("$100.00");
        });

        it("should format EUR with symbol", () => {
            expect(formatCurrency(50, "EUR")).toBe("€50.00");
        });

        it("should format with thousand separators", () => {
            expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
            expect(formatCurrency(1000000, "USD")).toBe("$1,000,000.00");
        });

        it("should format without symbol when requested", () => {
            expect(formatCurrency(100, "USD", { showSymbol: false })).toBe("100.00");
        });

        it("should respect decimal places", () => {
            expect(formatCurrency(100.123, "USD", { decimals: 2 })).toBe("$100.12");
            expect(formatCurrency(100.129, "USD", { decimals: 2 })).toBe("$100.13");
        });

        it("should handle zero", () => {
            expect(formatCurrency(0, "USD")).toBe("$0.00");
        });

        it("should handle negative amounts", () => {
            expect(formatCurrency(-50, "USD")).toBe("$-50.00");
        });
    });

    describe("parseCurrencyString", () => {
        it("should parse dollar amounts", () => {
            expect(parseCurrencyString("$100")).toBe(100);
            expect(parseCurrencyString("$100.50")).toBe(100.50);
        });

        it("should parse euro amounts", () => {
            expect(parseCurrencyString("€50")).toBe(50);
            expect(parseCurrencyString("€50.25")).toBe(50.25);
        });

        it("should handle thousand separators", () => {
            expect(parseCurrencyString("$1,000.00")).toBe(1000);
            expect(parseCurrencyString("€10,000.50")).toBe(10000.50);
        });

        it("should handle plain numbers", () => {
            expect(parseCurrencyString("100")).toBe(100);
            expect(parseCurrencyString("50.25")).toBe(50.25);
        });

        it("should handle whitespace", () => {
            expect(parseCurrencyString(" $100 ")).toBe(100);
            expect(parseCurrencyString("$ 100.50")).toBe(100.50);
        });

        it("should return 0 for invalid input", () => {
            expect(parseCurrencyString("abc")).toBe(0);
            expect(parseCurrencyString("")).toBe(0);
        });
    });

    describe("getCurrencySymbol", () => {
        it("should return USD symbol", () => {
            expect(getCurrencySymbol("USD")).toBe("$");
        });

        it("should return EUR symbol", () => {
            expect(getCurrencySymbol("EUR")).toBe("€");
        });
    });

    describe("getCurrencyName", () => {
        it("should return USD name", () => {
            expect(getCurrencyName("USD")).toBe("US Dollar");
        });

        it("should return EUR name", () => {
            expect(getCurrencyName("EUR")).toBe("Euro");
        });
    });

    describe("isValidCurrency", () => {
        it("should validate USD", () => {
            expect(isValidCurrency("USD")).toBe(true);
        });

        it("should validate EUR", () => {
            expect(isValidCurrency("EUR")).toBe(true);
        });

        it("should reject invalid currencies", () => {
            expect(isValidCurrency("GBP")).toBe(false);
            expect(isValidCurrency("JPY")).toBe(false);
            expect(isValidCurrency("invalid")).toBe(false);
        });
    });

    describe("Real-world scenarios", () => {
        it("should handle recipe cost calculation across currencies", () => {
            // Ingredient priced at €50, recipe selling price in USD
            const ingredientCostEUR = 50;
            const ingredientCostUSD = convertCurrency(ingredientCostEUR, "EUR", "USD");

            expect(ingredientCostUSD).toBeCloseTo(54.35, 1);
        });

        it("should format invoice amounts", () => {
            const amount = 1234.56;

            const formattedUSD = formatCurrency(amount, "USD");
            const formattedEUR = formatCurrency(amount, "EUR");

            expect(formattedUSD).toBe("$1,234.56");
            expect(formattedEUR).toBe("€1,234.56");
        });

        it("should handle supplier pricing in different currencies", () => {
            const suppliers = [
                { name: "US Supplier", price: 100, currency: "USD" as Currency },
                { name: "EU Supplier", price: 92, currency: "EUR" as Currency },
            ];

            // Convert all to USD for comparison
            const pricesInUSD = suppliers.map(s => ({
                name: s.name,
                priceUSD: convertCurrency(s.price, s.currency, "USD"),
            }));

            expect(pricesInUSD[0].priceUSD).toBe(100);
            expect(pricesInUSD[1].priceUSD).toBeCloseTo(100, 0);
        });
    });

    describe("Currency configuration", () => {
        it("should have proper rate relationships", () => {
            // USD should always be 1.0 (base currency)
            expect(CURRENCIES.USD.rate).toBe(1.0);

            // EUR should be less than 1.0 (currently stronger)
            expect(CURRENCIES.EUR.rate).toBeLessThan(1.0);
            expect(CURRENCIES.EUR.rate).toBeGreaterThan(0);
        });

        it("should have symbols for all currencies", () => {
            expect(CURRENCIES.USD.symbol).toBeTruthy();
            expect(CURRENCIES.EUR.symbol).toBeTruthy();
        });

        it("should have names for all currencies", () => {
            expect(CURRENCIES.USD.name).toBeTruthy();
            expect(CURRENCIES.EUR.name).toBeTruthy();
        });
    });
});
