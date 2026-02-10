import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { suppliersRepository } from "../suppliers.repository";

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
    limit: vi.fn(() => chain),
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

describe("SuppliersRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all suppliers sorted by name", async () => {
      const mockRows = [
        { id: 1, name: "A Supplier" },
        { id: 2, name: "B Supplier" },
      ];
      dbMock.execute.mockResolvedValue(mockRows);

      const result = await suppliersRepository.getAll();

      expect(dbMock.selectFrom).toHaveBeenCalledWith("suppliers");
      expect(dbMock.orderBy).toHaveBeenCalledWith("name", "asc");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("A Supplier");
    });
  });

  describe("create", () => {
    it("should create a new supplier", async () => {
      const input = { name: "New Supplier", email: "test@example.com" };
      const mockResult = {
        id: 1,
        name: "New Supplier",
        email: "test@example.com",
      };

      dbMock.executeTakeFirstOrThrow.mockResolvedValue(mockResult);

      // biome-ignore lint/suspicious/noExplicitAny: Input doesn't need full type for create
      const result = await suppliersRepository.create(input as any);

      expect(dbMock.insertInto).toHaveBeenCalledWith("suppliers");
      expect(dbMock.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Supplier",
          email: "test@example.com",
        }),
      );
      expect(result.id).toBe(1);
    });
  });

  describe("delete", () => {
    it("should delete a supplier if not linked to ingredients", async () => {
      dbMock.execute.mockResolvedValue([]); // No linked ingredients
      dbMock.execute.mockResolvedValueOnce([]); // For the link check

      await suppliersRepository.delete(1);

      expect(dbMock.deleteFrom).toHaveBeenCalledWith("suppliers");
      expect(dbMock.where).toHaveBeenCalledWith("id", "=", 1);
    });

    it("should throw error if linked to ingredients", async () => {
      dbMock.execute.mockResolvedValue([{ id: 5 }]); // Linked ingredient found

      await expect(suppliersRepository.delete(1)).rejects.toThrow(
        "Cannot delete supplier while it is linked to ingredients",
      );
    });
  });
});
