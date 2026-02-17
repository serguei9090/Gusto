import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import type { RecipeWithIngredients } from "@/types/ingredient.types";
import { CircularReferenceError } from "@/utils/costEngine";
import { RecipesRepository } from "../recipes.repository";

// Mock the database
vi.mock("@/lib/db", () => {
  const chain = {
    selectFrom: vi.fn(() => chain),
    insertInto: vi.fn(() => chain),
    updateTable: vi.fn(() => chain),
    deleteFrom: vi.fn(() => chain),
    selectAll: vi.fn(() => chain),
    select: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
    where: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    values: vi.fn(() => chain),
    set: vi.fn(() => chain),
    returning: vi.fn(() => chain),
    returningAll: vi.fn(() => chain),
    execute: vi.fn(),
    executeTakeFirst: vi.fn(),
    executeTakeFirstOrThrow: vi.fn(),
    transaction: vi.fn(() => ({
      execute: vi.fn((cb) => cb(chain)),
    })),
  };

  return {
    db: chain,
    sql: vi.fn((strings) => strings[0]),
  };
});

// biome-ignore lint/suspicious/noExplicitAny: Mocking Kysely requires loose types
const dbMock = db as any;

// Mock cost engine
vi.mock("@/utils/costEngine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/costEngine")>();
  return {
    ...actual,
    calculateRecipeTotal: vi.fn(async () => ({
      totalCost: 10,
      subtotal: 10,
      wasteCost: 0,
      errors: [],
    })),
    calculateSuggestedPrice: vi.fn(() => 40),
    calculateProfitMargin: vi.fn(() => 75),
  };
});

// Mock finance service to avoid Tauri invoke in tests
vi.mock("@/modules/core/finance/services/finance.service", () => ({
  financeService: {
    calculateStandardCost: vi.fn(async () => ({
      raw_materials: 2,
      direct_labor: 3,
      labor_taxes: 1,
      prime_cost: 6,
      variable_overhead: 2,
      fixed_overhead: 2,
      total_cost_of_goods: 10,
      fully_loaded_cost: 10,
    })),
  },
}));

// Mock finance repository
vi.mock("@/modules/core/finance/services/finance.repository", () => ({
  financeRepository: {
    saveRecipeFinancials: vi.fn(async () => undefined),
    getRecipeFinancials: vi.fn(async () => ({})),
  },
}));

describe("RecipesRepository", () => {
  let repository: RecipesRepository;

  beforeEach(() => {
    repository = new RecipesRepository();
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return a recipe with ingredients when found", async () => {
      const mockRecipeRow = {
        id: 1,
        name: "Pasta",
        servings: 2,
        is_experiment: 0,
      };

      const mockIngredientRows = [
        {
          id: 10,
          recipeId: 1,
          ingredientId: 5,
          quantity: 200,
          unit: "g",
          ingredientName: "Flour",
          currentPricePerUnit: 0.01,
          ingredientUnit: "g",
          isSubRecipe: 0,
        },
      ];

      dbMock.executeTakeFirst.mockResolvedValueOnce(mockRecipeRow);
      dbMock.execute.mockResolvedValueOnce(mockIngredientRows);

      const result = await repository.getById(1);

      expect(dbMock.selectFrom).toHaveBeenCalledWith("recipes");
      expect(result?.name).toBe("Pasta");
      expect(result?.ingredients).toHaveLength(1);
      expect(result?.ingredients[0].ingredientName).toBe("Flour");
    });

    it("should return null when recipe not found", async () => {
      dbMock.executeTakeFirst.mockResolvedValueOnce(null);

      const result = await repository.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a basic recipe", async () => {
      const input = {
        name: "New Recipe",
        servings: 4,
      };

      const mockResult = {
        id: 1,
        name: "New Recipe",
        servings: 4,
        is_experiment: 0,
      };
      dbMock.executeTakeFirstOrThrow.mockResolvedValue(mockResult);

      const result = await repository.create(input);

      expect(dbMock.insertInto).toHaveBeenCalledWith("recipes");
      expect(dbMock.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Recipe",
          servings: 4,
        }),
      );
      expect(result.id).toBe(1);
    });
  });

  describe("recalculateCosts", () => {
    it("should update recipe with new cost and margin", async () => {
      const mockRecipe = {
        id: 1,
        name: "Pasta",
        ingredients: [
          {
            ingredientName: "Flour",
            quantity: 200,
            unit: "g",
            currentPricePerUnit: 0.01,
            ingredientUnit: "g",
          },
        ],
        wasteBufferPercentage: 5,
        targetCostPercentage: 25,
        sellingPrice: 50,
      };

      // biome-ignore lint/suspicious/noExplicitAny: Mocking internal call
      vi.spyOn(repository, "getById").mockResolvedValue(mockRecipe as any);
      dbMock.execute.mockResolvedValue({ numUpdatedRows: 1n });

      await repository.recalculateCosts(1);

      expect(dbMock.updateTable).toHaveBeenCalledWith("recipes");
      expect(dbMock.set).toHaveBeenCalledWith(
        expect.objectContaining({
          total_cost: 10, // from mock costEngine
          profit_margin: 75, // from mock costEngine
        }),
      );
    });
  });

  describe("createExperiment", () => {
    it("should create a copy of a recipe as an experiment", async () => {
      const parentRecipe = {
        id: 1,
        name: "Pasta",
        ingredients: [{ ingredientId: 5, quantity: 200, unit: "g", cost: 2 }],
      };

      // biome-ignore lint/suspicious/noExplicitAny: Mocking internal call
      vi.spyOn(repository, "getById").mockResolvedValue(parentRecipe as any);

      const mockExpResult = {
        id: 2,
        name: "Pasta - Test Exp",
        parent_recipe_id: 1,
        is_experiment: 1,
      };
      dbMock.executeTakeFirstOrThrow.mockResolvedValue(mockExpResult);

      const result = await repository.createExperiment(1, "Test Exp");

      expect(dbMock.insertInto).toHaveBeenCalledWith("recipes");
      expect(dbMock.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Pasta - Test Exp",
          parent_recipe_id: 1,
          is_experiment: 1,
        }),
      );

      expect(dbMock.insertInto).toHaveBeenCalledWith("recipe_ingredients");
      expect(result.id).toBe(2);
    });

    it("should throw error if parent recipe not found", async () => {
      vi.spyOn(repository, "getById").mockResolvedValue(null);
      await expect(repository.createExperiment(999, "Test")).rejects.toThrow(
        "Parent recipe 999 not found",
      );
    });
  });

  describe("applyExperimentToParent", () => {
    it("should update parent with experiment data", async () => {
      const mockExperiment = {
        id: 2,
        name: "Pasta - Test Exp",
        servings: 4,
        sellingPrice: 50,
        ingredients: [],
      };

      const mockExpRow = { id: 2, parent_recipe_id: 1, is_experiment: 1 };

      vi.spyOn(repository, "getById").mockResolvedValue(
        mockExperiment as unknown as RecipeWithIngredients,
      );
      dbMock.executeTakeFirst.mockResolvedValue(mockExpRow);

      const updateSpy = vi.spyOn(repository, "update").mockResolvedValue();

      await repository.applyExperimentToParent(2);

      expect(updateSpy).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          servings: 4,
          sellingPrice: 50,
        }),
      );
    });
  });

  describe("delete", () => {
    it("should delete recipe", async () => {
      await repository.delete(1);
      expect(dbMock.deleteFrom).toHaveBeenCalledWith("recipes");
      expect(dbMock.where).toHaveBeenCalledWith("id", "=", 1);
    });
  });

  describe("validateNoCircularReferences", () => {
    it("should throw error if recipe refers to itself", async () => {
      vi.spyOn(repository, "getById").mockResolvedValue({
        name: "Self Recipe",
      } as unknown as RecipeWithIngredients);

      await expect(
        repository.validateNoCircularReferences(1, [{ subRecipeId: 1 }]),
      ).rejects.toThrow(CircularReferenceError);
    });

    it("should detect indirect cycles", async () => {
      // 1 -> 2 -> 1
      dbMock.execute.mockResolvedValueOnce([{ sub_recipe_id: 1 }]); // subRecipes for ID 2
      vi.spyOn(repository, "getById").mockResolvedValue({
        name: "Sub Recipe",
      } as unknown as RecipeWithIngredients);

      await expect(
        repository.validateNoCircularReferences(1, [{ subRecipeId: 2 }]),
      ).rejects.toThrow(CircularReferenceError);

      expect(dbMock.selectFrom).toHaveBeenCalledWith("recipe_ingredients");
    });
  });
});
