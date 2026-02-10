import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { IngredientsRepository } from "../ingredients.repository";

// Mock the database
vi.mock("@/lib/db", () => {
  const chain = {
    selectFrom: vi.fn(() => chain),
    insertInto: vi.fn(() => chain),
    updateTable: vi.fn(() => chain),
    deleteFrom: vi.fn(() => chain),
    selectAll: vi.fn(() => chain),
    select: vi.fn(() => chain),
    where: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    values: vi.fn(() => chain),
    set: vi.fn(() => chain),
    returning: vi.fn(() => chain),
    returningAll: vi.fn(() => chain),
    execute: vi.fn(),
    executeTakeFirst: vi.fn(),
    executeTakeFirstOrThrow: vi.fn(),
  };

  return {
    db: chain,
  };
});

// biome-ignore lint/suspicious/noExplicitAny: Mocking Kysely requires loose types
const dbMock = db as any;

// Mock the logger
vi.mock("@/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("IngredientsRepository", () => {
  let repository: IngredientsRepository;

  beforeEach(() => {
    repository = new IngredientsRepository();
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return an ingredient when found", async () => {
      const mockRow = {
        id: 1,
        name: "Salt",
        category: "Spice",
        unit_of_measure: "g",
        current_price: 1.5,
        price_per_unit: 0.0015,
        currency: "USD",
        is_active: 1,
      };

      dbMock.executeTakeFirst.mockResolvedValue(mockRow);

      const result = await repository.getById(1);

      expect(dbMock.selectFrom).toHaveBeenCalledWith("ingredients");
      expect(dbMock.where).toHaveBeenCalledWith("id", "=", 1);
      expect(result).toEqual({
        id: 1,
        name: "Salt",
        category: "Spice",
        unitOfMeasure: "g",
        currentPrice: 1.5,
        pricePerUnit: 0.0015,
        currency: "USD",
        supplierId: undefined,
        minStockLevel: undefined,
        currentStock: undefined,
        lastUpdated: undefined,
        notes: undefined,
        purchaseUnit: undefined,
        conversionRatio: undefined,
        isActive: true,
      });
    });

    it("should return null when not found", async () => {
      dbMock.executeTakeFirst.mockResolvedValue(null);

      const result = await repository.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all active ingredients", async () => {
      const mockRows = [
        { id: 1, name: "Apple", is_active: 1 },
        { id: 2, name: "Banana", is_active: 1 },
      ];

      dbMock.execute.mockResolvedValue(mockRows);

      const result = await repository.getAll();

      expect(dbMock.selectFrom).toHaveBeenCalledWith("ingredients");
      expect(dbMock.where).toHaveBeenCalledWith("is_active", "=", 1);
      expect(dbMock.orderBy).toHaveBeenCalledWith("name", "asc");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Apple");
    });
  });

  describe("create", () => {
    it("should create an ingredient and record initial transaction if stock > 0", async () => {
      const input = {
        name: "Sugar",
        category: "Spice" as const,
        unitOfMeasure: "kg" as const,
        currentPrice: 2,
        pricePerUnit: 2,
        currentStock: 10,
      };

      const mockResult = { id: 100 };
      dbMock.executeTakeFirst.mockResolvedValueOnce(mockResult); // For insert

      const mockReturn = {
        id: 100,
        name: "Sugar",
        is_active: 1,
        current_price: 2,
        price_per_unit: 2,
      };
      // For the getById call inside create
      dbMock.executeTakeFirst.mockResolvedValueOnce(mockReturn);

      const result = await repository.create(input);

      expect(dbMock.insertInto).toHaveBeenCalledWith("ingredients");
      expect(dbMock.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Sugar",
          current_stock: 10,
        }),
      );

      // Verify transaction recording
      expect(dbMock.insertInto).toHaveBeenCalledWith("inventory_transactions");
      expect(dbMock.values).toHaveBeenCalledWith(
        expect.objectContaining({
          ingredient_id: 100,
          quantity: 10,
          transaction_type: "purchase",
        }),
      );

      expect(result.id).toBe(100);
      expect(result.name).toBe("Sugar");
    });
  });

  describe("update", () => {
    it("should update an existing ingredient", async () => {
      const mockResult = { id: 1 };
      dbMock.executeTakeFirst.mockResolvedValueOnce(mockResult); // For update returning

      const mockReturn = { id: 1, name: "Salt Updated", is_active: 1 };
      dbMock.executeTakeFirst.mockResolvedValueOnce(mockReturn); // For getById

      const result = await repository.update(1, { name: "Salt Updated" });

      expect(dbMock.updateTable).toHaveBeenCalledWith("ingredients");
      expect(dbMock.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Salt Updated",
        }),
      );
      expect(result?.name).toBe("Salt Updated");
    });
  });

  describe("delete", () => {
    it("should delete an ingredient", async () => {
      dbMock.executeTakeFirst.mockResolvedValue({ numDeletedRows: 1n });

      const result = await repository.delete(1);

      expect(dbMock.deleteFrom).toHaveBeenCalledWith("ingredients");
      expect(result).toBe(true);
    });
  });

  describe("archive", () => {
    it("should archive an ingredient (soft delete)", async () => {
      dbMock.executeTakeFirst.mockResolvedValue({ numUpdatedRows: 1n });

      const result = await repository.archive(1);

      expect(dbMock.updateTable).toHaveBeenCalledWith("ingredients");
      expect(dbMock.set).toHaveBeenCalledWith({ is_active: 0 });
      expect(result).toBe(true);
    });
  });
});
