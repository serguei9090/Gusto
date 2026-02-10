import { beforeEach, describe, expect, it, vi } from "vitest";
import { ingredientsRepository } from "../../services/ingredients.repository";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../../types";
import { useIngredientsStore } from "../ingredients.store";

// Mock the repository
vi.mock("../../services/ingredients.repository", () => ({
  ingredientsRepository: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    archive: vi.fn(),
    search: vi.fn(),
  },
}));

const ingredientsRepoMock = vi.mocked(ingredientsRepository);

describe("IngredientsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useIngredientsStore.setState({
      ingredients: [],
      isLoading: false,
      error: null,
    });
  });

  describe("fetchIngredients", () => {
    it("should fetch ingredients and update state", async () => {
      const mockIngredients: Ingredient[] = [
        {
          id: 1,
          name: "Salt",
          category: "Pantry",
          unitOfMeasure: "kg",
          currentPrice: 1,
          pricePerUnit: 1,
          currency: "USD",
          supplierId: null,
          minStockLevel: 0,
          currentStock: 10,
          lastUpdated: new Date().toISOString(),
          notes: null,
          isActive: true,
        },
      ];
      ingredientsRepoMock.getAll.mockResolvedValue(mockIngredients);

      await useIngredientsStore.getState().fetchIngredients();

      expect(ingredientsRepository.getAll).toHaveBeenCalled();
      expect(useIngredientsStore.getState().ingredients).toEqual(
        mockIngredients,
      );
      expect(useIngredientsStore.getState().isLoading).toBe(false);
    });

    it("should handle errors during fetch", async () => {
      ingredientsRepoMock.getAll.mockRejectedValue(new Error("Fetch failed"));

      await useIngredientsStore.getState().fetchIngredients();

      expect(useIngredientsStore.getState().error).toBe("Error: Fetch failed");
      expect(useIngredientsStore.getState().isLoading).toBe(false);
    });
  });

  describe("createIngredient", () => {
    it("should call create and then re-fetch", async () => {
      const input: CreateIngredientInput = {
        name: "Sugar",
        category: "Other",
        unitOfMeasure: "kg",
        currentPrice: 2,
        pricePerUnit: 2,
      };
      const mockResult: Ingredient = {
        id: 2,
        ...input,
        currency: "USD",
        supplierId: null,
        minStockLevel: null,
        currentStock: 0,
        lastUpdated: new Date().toISOString(),
        notes: null,
        isActive: true,
      };
      ingredientsRepoMock.create.mockResolvedValue(mockResult);
      ingredientsRepoMock.getAll.mockResolvedValue([mockResult]);

      await useIngredientsStore.getState().createIngredient(input);

      expect(ingredientsRepository.create).toHaveBeenCalledWith(input);
      expect(ingredientsRepository.getAll).toHaveBeenCalled();
      expect(useIngredientsStore.getState().ingredients).toHaveLength(1);
    });

    it("should handle creation errors", async () => {
      const input: CreateIngredientInput = {
        name: "Sugar",
        category: "Other",
        unitOfMeasure: "kg",
        currentPrice: 2,
        pricePerUnit: 2,
      };
      ingredientsRepoMock.create.mockRejectedValue(new Error("Create failed"));

      await expect(
        useIngredientsStore.getState().createIngredient(input),
      ).rejects.toThrow("Create failed");
      expect(useIngredientsStore.getState().error).toBe("Error: Create failed");
    });
  });

  describe("updateIngredient", () => {
    it("should update ingredient and re-fetch", async () => {
      const input: UpdateIngredientInput = { name: "Updated Salt" };
      ingredientsRepoMock.update.mockResolvedValue({
        id: 1,
        name: "Updated Salt",
        category: "Pantry",
        unitOfMeasure: "kg",
        currentPrice: 1,
        pricePerUnit: 1,
        currency: "USD",
        supplierId: null,
        minStockLevel: 0,
        currentStock: 10,
        lastUpdated: new Date().toISOString(),
        notes: null,
        isActive: true,
      });

      await useIngredientsStore.getState().updateIngredient(1, input);

      expect(ingredientsRepository.update).toHaveBeenCalledWith(1, input);
      expect(ingredientsRepository.getAll).toHaveBeenCalled();
    });

    it("should handle update errors", async () => {
      ingredientsRepoMock.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        useIngredientsStore
          .getState()
          .updateIngredient(1, {} as UpdateIngredientInput),
      ).rejects.toThrow("Update failed");
      expect(useIngredientsStore.getState().error).toBe("Error: Update failed");
    });
  });

  describe("deleteIngredient", () => {
    it("should delete ingredient and re-fetch", async () => {
      ingredientsRepoMock.delete.mockResolvedValue(true);
      await useIngredientsStore.getState().deleteIngredient(1);

      expect(ingredientsRepository.delete).toHaveBeenCalledWith(1);
      expect(ingredientsRepository.getAll).toHaveBeenCalled();
    });

    it("should handle deletion errors", async () => {
      ingredientsRepoMock.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(
        useIngredientsStore.getState().deleteIngredient(1),
      ).rejects.toThrow("Delete failed");
      expect(useIngredientsStore.getState().error).toBe("Error: Delete failed");
    });
  });

  describe("archiveIngredient", () => {
    it("should archive ingredient and re-fetch", async () => {
      ingredientsRepoMock.archive.mockResolvedValue(true);
      await useIngredientsStore.getState().archiveIngredient(1);

      expect(ingredientsRepository.archive).toHaveBeenCalledWith(1);
      expect(ingredientsRepository.getAll).toHaveBeenCalled();
    });

    it("should handle archive errors", async () => {
      ingredientsRepoMock.archive.mockRejectedValue(
        new Error("Archive failed"),
      );

      await expect(
        useIngredientsStore.getState().archiveIngredient(1),
      ).rejects.toThrow("Archive failed");
      expect(useIngredientsStore.getState().error).toBe(
        "Error: Archive failed",
      );
    });
  });

  describe("searchIngredients", () => {
    it("should update results for non-empty query", async () => {
      const results: Ingredient[] = [
        {
          id: 1,
          name: "Salt",
          category: "Pantry",
          unitOfMeasure: "kg",
          currentPrice: 1,
          pricePerUnit: 1,
          currency: "USD",
          supplierId: null,
          minStockLevel: 0,
          currentStock: 10,
          lastUpdated: new Date().toISOString(),
          notes: null,
          isActive: true,
        },
      ];
      ingredientsRepoMock.search.mockResolvedValue(results);

      await useIngredientsStore.getState().searchIngredients("sal");

      expect(ingredientsRepository.search).toHaveBeenCalledWith("sal");
      expect(useIngredientsStore.getState().ingredients).toEqual(results);
    });

    it("should re-fetch all for empty query", async () => {
      await useIngredientsStore.getState().searchIngredients("  ");

      expect(ingredientsRepository.getAll).toHaveBeenCalled();
      expect(ingredientsRepository.search).not.toHaveBeenCalled();
    });

    it("should handle search errors", async () => {
      ingredientsRepoMock.search.mockRejectedValue(new Error("Search failed"));

      await useIngredientsStore.getState().searchIngredients("sal");

      expect(useIngredientsStore.getState().error).toBe("Error: Search failed");
    });
  });
});
