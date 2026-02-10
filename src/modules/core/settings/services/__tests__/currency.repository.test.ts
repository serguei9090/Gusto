import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { CurrencyRepository } from "../currency.repository";

// Mock the database
vi.mock("@/lib/db", () => {
  const chain = {
    selectFrom: vi.fn(() => chain),
    selectAll: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    where: vi.fn(() => chain),
    whereRef: vi.fn(() => chain),
    select: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    insertInto: vi.fn(() => chain),
    values: vi.fn(() => chain),
    updateTable: vi.fn(() => chain),
    set: vi.fn(() => chain),
    onConflict: vi.fn(() => chain),
    column: vi.fn(() => chain),
    doUpdateSet: vi.fn(() => chain),
    deleteFrom: vi.fn(() => chain),
    or: vi.fn(() => chain),
    execute: vi.fn(),
    executeTakeFirst: vi.fn(),
  };

  return {
    db: chain,
    sql: Object.assign(
      vi.fn((strings) => strings[0]),
      { as: vi.fn() },
    ),
  };
});

// biome-ignore lint/suspicious/noExplicitAny: Mocking Kysely requires loose types
const dbMock = db as any;

describe("CurrencyRepository", () => {
  let repository: CurrencyRepository;

  beforeEach(() => {
    repository = new CurrencyRepository();
    vi.clearAllMocks();
  });

  describe("getAllCurrencies", () => {
    it("should return mapped currencies", async () => {
      const mockRows = [
        {
          code: "USD",
          name: "US Dollar",
          symbol: "$",
          decimal_places: 2,
          is_active: 1,
        },
      ];
      dbMock.execute.mockResolvedValue(mockRows);

      const result = await repository.getAllCurrencies();
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("USD");
      expect(result[0].isActive).toBe(true);
      expect(dbMock.selectFrom).toHaveBeenCalledWith("currencies");
    });
  });

  describe("getCurrency", () => {
    it("should return currency if found", async () => {
      const mockRow = {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        decimal_places: 2,
        is_active: 1,
      };
      dbMock.executeTakeFirst.mockResolvedValue(mockRow);

      const result = await repository.getCurrency("EUR");
      expect(result).toEqual({
        code: "EUR",
        name: "Euro",
        symbol: "€",
        decimalPlaces: 2,
        isActive: true,
      });
    });

    it("should return null if not found", async () => {
      dbMock.executeTakeFirst.mockResolvedValue(undefined);
      const result = await repository.getCurrency("XYZ");
      expect(result).toBeNull();
    });
  });

  describe("getAllExchangeRates", () => {
    it("should return exchange rates", async () => {
      const mockRows = [
        {
          id: 1,
          from_currency: "USD",
          to_currency: "EUR",
          rate: 0.9,
          effective_date: "2024-01-01",
          source: "manual",
        },
      ];
      dbMock.execute.mockResolvedValue(mockRows);

      const result = await repository.getAllExchangeRates();
      expect(result).toHaveLength(1);
      expect(result[0].fromCurrency).toBe("USD");
    });
  });

  describe("addCurrency", () => {
    it("should insert currency", async () => {
      await repository.addCurrency({
        code: "JPY",
        name: "Yen",
        symbol: "¥",
        decimalPlaces: 0,
      });

      expect(dbMock.insertInto).toHaveBeenCalledWith("currencies");
      expect(dbMock.values).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "JPY",
          decimal_places: 0,
        }),
      );
    });
  });

  describe("getBaseCurrency", () => {
    it("should return stored base currency", async () => {
      dbMock.executeTakeFirst.mockResolvedValue({ value: "EUR" });
      const result = await repository.getBaseCurrency();
      expect(result).toBe("EUR");
    });

    it("should default to USD if not found", async () => {
      dbMock.executeTakeFirst.mockResolvedValue(undefined);
      const result = await repository.getBaseCurrency();
      expect(result).toBe("USD");
    });
  });

  describe("checkCurrencyUsage", () => {
    it("should return true if used in ingredients", async () => {
      dbMock.executeTakeFirst
        .mockResolvedValueOnce({ count: 1 }) // ingredients
        .mockResolvedValueOnce({ count: 0 }) // recipes
        .mockResolvedValueOnce({ count: 0 }); // versions

      const result = await repository.checkCurrencyUsage("USD");
      expect(result).toBe(true);
    });

    it("should return false if not used", async () => {
      dbMock.executeTakeFirst
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      const result = await repository.checkCurrencyUsage("USD");
      expect(result).toBe(false);
    });
  });

  describe("deleteCurrency", () => {
    it("should delete exchange rates and currency", async () => {
      await repository.deleteCurrency("USD");

      expect(dbMock.deleteFrom).toHaveBeenCalledWith("exchange_rates");
      expect(dbMock.deleteFrom).toHaveBeenCalledWith("currencies");
    });
  });
});
