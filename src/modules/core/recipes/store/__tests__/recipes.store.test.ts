import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CreateRecipeInput,
  Recipe,
  RecipeWithIngredients,
  UpdateRecipeInput,
} from "@/types/ingredient.types";
import { recipesRepository } from "../../services/recipes.repository";
import { recipeVersionRepository } from "../../services/recipeVersion.repository";
import { useRecipeStore } from "../recipes.store";

// Mock the repositories
vi.mock("../../services/recipes.repository", () => ({
  recipesRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    createFull: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createExperiment: vi.fn(),
    applyExperimentToParent: vi.fn(),
  },
}));

vi.mock("../../services/recipeVersion.repository", () => ({
  recipeVersionRepository: {
    createVersion: vi.fn(),
    bulkRollbackToDate: vi.fn(),
  },
}));

const recipesRepoMock = vi.mocked(recipesRepository);
const recipeVersionRepoMock = vi.mocked(recipeVersionRepository);

describe("RecipesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecipeStore.setState({
      recipes: [],
      selectedRecipe: null,
      isLoading: false,
      error: null,
      searchQuery: "",
      categoryFilter: "all",
    });
  });

  describe("fetchRecipes", () => {
    it("should fetch recipes and update state", async () => {
      const mockRecipes: Recipe[] = [
        {
          id: 1,
          name: "Pasta",
          description: null,
          category: null,
          servings: 1,
          currency: "USD",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          prepTimeMinutes: null,
          cookingInstructions: null,
          sellingPrice: null,
          targetCostPercentage: null,
          wasteBufferPercentage: null,
          totalCost: null,
          profitMargin: null,
        },
      ];
      recipesRepoMock.getAll.mockResolvedValue(mockRecipes);

      await useRecipeStore.getState().fetchRecipes();

      expect(recipesRepository.getAll).toHaveBeenCalled();
      expect(useRecipeStore.getState().recipes).toEqual(mockRecipes);
      expect(useRecipeStore.getState().isLoading).toBe(false);
    });

    it("should handle Error object in catch", async () => {
      recipesRepoMock.getAll.mockRejectedValue(new Error("Fetch error"));
      await useRecipeStore.getState().fetchRecipes();
      expect(useRecipeStore.getState().error).toBe("Fetch error");
    });

    it("should handle non-Error object in catch", async () => {
      recipesRepoMock.getAll.mockRejectedValue("String error");
      await useRecipeStore.getState().fetchRecipes();
      expect(useRecipeStore.getState().error).toBe("Failed to fetch recipes");
    });
  });

  describe("fetchFullRecipe", () => {
    it("should fetch full recipe and set selectedRecipe", async () => {
      const mockFull: RecipeWithIngredients = {
        id: 1,
        name: "Pasta",
        ingredients: [],
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      recipesRepoMock.getById.mockResolvedValue(mockFull);

      await useRecipeStore.getState().fetchFullRecipe(1);

      expect(recipesRepository.getById).toHaveBeenCalledWith(1);
      expect(useRecipeStore.getState().selectedRecipe).toEqual(mockFull);
    });

    it("should handle non-Error in detail fetch", async () => {
      recipesRepoMock.getById.mockRejectedValue(null);
      await useRecipeStore.getState().fetchFullRecipe(1);
      expect(useRecipeStore.getState().error).toBe(
        "Failed to fetch recipe details",
      );
    });
  });

  describe("createRecipe", () => {
    it("should call create for basic recipe", async () => {
      const input: CreateRecipeInput = { name: "Pizza", servings: 2 };
      const mockNew: Recipe = {
        id: 2,
        ...input,
        description: null,
        category: null,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      recipesRepoMock.create.mockResolvedValue(mockNew);

      const result = await useRecipeStore.getState().createRecipe(input);

      expect(recipesRepository.create).toHaveBeenCalledWith(input);
      expect(useRecipeStore.getState().recipes).toContainEqual(mockNew);
      expect(result).toEqual(mockNew);
    });

    it("should call createFull when ingredients are provided", async () => {
      const input = {
        name: "Pizza",
        servings: 2,
        ingredients: [{ ingredientId: 1, quantity: 1, unit: "kg" }],
      };
      const mockNew: Recipe = {
        id: 3,
        name: input.name,
        servings: input.servings,
        description: null,
        category: null,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      recipesRepoMock.createFull.mockResolvedValue(mockNew);

      await useRecipeStore.getState().createRecipe(input);

      expect(recipesRepository.createFull).toHaveBeenCalled();
    });

    it("should handle non-Error object in creation", async () => {
      recipesRepoMock.create.mockRejectedValue({});
      await expect(
        useRecipeStore.getState().createRecipe({ name: "Fail", servings: 1 }),
      ).rejects.toBeDefined();
      expect(useRecipeStore.getState().error).toBe("Failed to create recipe");
    });
  });

  describe("updateRecipe", () => {
    it("should update recipe, create version, and refresh state", async () => {
      const updateInput: UpdateRecipeInput = { name: "Pasta V2" };
      recipesRepoMock.update.mockResolvedValue(undefined);
      recipeVersionRepoMock.createVersion.mockResolvedValue({
        id: 100,
        recipeId: 1,
        versionNumber: 2,
        name: "Pasta V2",
        description: null,
        category: null,
        servings: 1,
        yieldAmount: null,
        yieldUnit: null,
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        currency: "USD",
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
        ingredientsSnapshot: [],
        changeReason: "Update",
        changeNotes: "notes",
        createdBy: "user",
        createdAt: new Date().toISOString(),
        isCurrent: true,
      });
      const updatedRecipe: Recipe = {
        id: 1,
        name: "Pasta V2",
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      recipesRepoMock.getAll.mockResolvedValue([updatedRecipe]);

      // Test refresh of selected recipe
      const mockSelected: RecipeWithIngredients = {
        id: 1,
        name: "Pasta",
        ingredients: [],
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      useRecipeStore.setState({
        selectedRecipe: mockSelected,
      });
      recipesRepoMock.getById.mockResolvedValue({
        ...mockSelected,
        name: "Pasta V2",
      });

      await useRecipeStore.getState().updateRecipe(1, updateInput);

      expect(recipesRepository.update).toHaveBeenCalledWith(1, updateInput);
      expect(recipeVersionRepository.createVersion).toHaveBeenCalled();
      expect(recipesRepository.getById).toHaveBeenCalledWith(1);
      expect(useRecipeStore.getState().selectedRecipe?.name).toBe("Pasta V2");
    });

    it("should NOT refresh selected recipe if ID mismatch", async () => {
      const mockSelected: RecipeWithIngredients = {
        id: 2,
        name: "Other",
        ingredients: [],
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      useRecipeStore.setState({
        selectedRecipe: mockSelected,
      });
      recipesRepoMock.update.mockResolvedValue(undefined);
      recipesRepoMock.getAll.mockResolvedValue([]);

      await useRecipeStore.getState().updateRecipe(1, { name: "New" });

      expect(recipesRepository.getById).not.toHaveBeenCalled();
    });

    it("should handle update errors with non-Error", async () => {
      recipesRepoMock.update.mockRejectedValue(404);
      await expect(
        useRecipeStore.getState().updateRecipe(1, {}),
      ).rejects.toBeDefined();
      expect(useRecipeStore.getState().error).toBe("Failed to update recipe");
    });
  });

  describe("deleteRecipe", () => {
    it("should delete recipe and update state", async () => {
      const mockRecipe: Recipe = {
        id: 1,
        name: "Del",
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      const mockSelected: RecipeWithIngredients = {
        ...mockRecipe,
        ingredients: [],
      };
      useRecipeStore.setState({
        recipes: [mockRecipe],
        selectedRecipe: mockSelected,
      });

      await useRecipeStore.getState().deleteRecipe(1);

      expect(recipesRepository.delete).toHaveBeenCalledWith(1);
      expect(useRecipeStore.getState().recipes).toHaveLength(0);
      expect(useRecipeStore.getState().selectedRecipe).toBeNull();
    });

    it("should handle non-Error in deletion", async () => {
      recipesRepoMock.delete.mockRejectedValue("fail");
      await expect(useRecipeStore.getState().deleteRecipe(1)).rejects.toBe(
        "fail",
      );
      expect(useRecipeStore.getState().error).toBe("Failed to delete recipe");
    });
  });

  describe("UI Actions", () => {
    it("should update filters and search", () => {
      const store = useRecipeStore.getState();

      store.setSearchQuery("test");
      expect(useRecipeStore.getState().searchQuery).toBe("test");

      store.setCategoryFilter("mains");
      expect(useRecipeStore.getState().categoryFilter).toBe("mains");

      const mockRecipe: RecipeWithIngredients = {
        id: 1,
        name: "Pasta",
        ingredients: [],
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      store.selectRecipe(mockRecipe);
      expect(useRecipeStore.getState().selectedRecipe).toBe(mockRecipe);
    });
  });

  describe("Experiments & Applied Actions", () => {
    it("should create an experiment", async () => {
      const mockExp: Recipe = {
        id: 3,
        name: "Pasta - Exp",
        isExperiment: true,
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      recipesRepoMock.createExperiment.mockResolvedValue(mockExp);

      await useRecipeStore.getState().createExperiment(1, "Exp");

      expect(recipesRepository.createExperiment).toHaveBeenCalledWith(1, "Exp");
      expect(useRecipeStore.getState().recipes).toContainEqual(mockExp);
    });

    it("should handle experiment creation errors with non-Error", async () => {
      recipesRepoMock.createExperiment.mockRejectedValue(null);
      await expect(
        useRecipeStore.getState().createExperiment(1, "Exp"),
      ).rejects.toBeDefined();
      expect(useRecipeStore.getState().error).toBe(
        "Failed to create experiment",
      );
    });

    it("should apply experiment to parent and refresh", async () => {
      recipesRepoMock.applyExperimentToParent.mockResolvedValue(undefined);
      recipesRepoMock.getAll.mockResolvedValue([
        {
          id: 1,
          name: "Updated Parent",
          description: null,
          category: null,
          servings: 1,
          currency: "USD",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          prepTimeMinutes: null,
          cookingInstructions: null,
          sellingPrice: null,
          targetCostPercentage: null,
          wasteBufferPercentage: null,
          totalCost: null,
          profitMargin: null,
        },
      ]);

      // Test refresh of selected parent
      const mockSelected: RecipeWithIngredients = {
        id: 1,
        name: "Old Parent",
        ingredients: [],
        description: null,
        category: null,
        servings: 1,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: null,
        cookingInstructions: null,
        sellingPrice: null,
        targetCostPercentage: null,
        wasteBufferPercentage: null,
        totalCost: null,
        profitMargin: null,
      };
      useRecipeStore.setState({ selectedRecipe: mockSelected });
      recipesRepoMock.getById.mockResolvedValue({
        ...mockSelected,
        name: "Refreshed",
      });

      await useRecipeStore.getState().applyExperimentToParent(2);

      expect(recipesRepository.applyExperimentToParent).toHaveBeenCalledWith(2);
      expect(recipesRepository.getById).toHaveBeenCalledWith(1);
      expect(useRecipeStore.getState().selectedRecipe?.name).toBe("Refreshed");
    });

    it("should handle application errors with non-Error", async () => {
      recipesRepoMock.applyExperimentToParent.mockRejectedValue("err");
      await expect(
        useRecipeStore.getState().applyExperimentToParent(1),
      ).rejects.toBeDefined();
      expect(useRecipeStore.getState().error).toBe(
        "Failed to apply experiment to original",
      );
    });
  });

  describe("bulkRollback", () => {
    it("should perform bulk rollback and return count", async () => {
      recipeVersionRepoMock.bulkRollbackToDate.mockResolvedValue(5);
      recipesRepoMock.getAll.mockResolvedValue([]);

      const result = await useRecipeStore
        .getState()
        .bulkRollback("2023-01-01", "Testing");

      expect(recipeVersionRepository.bulkRollbackToDate).toHaveBeenCalledWith(
        "2023-01-01",
        "Testing",
      );
      expect(result).toBe(5);
      expect(useRecipeStore.getState().selectedRecipe).toBeNull();
    });

    it("should handle rollback errors with non-Error", async () => {
      recipeVersionRepoMock.bulkRollbackToDate.mockRejectedValue("err");
      await expect(
        useRecipeStore.getState().bulkRollback("date"),
      ).rejects.toBeDefined();
      expect(useRecipeStore.getState().error).toBe(
        "Failed to perform bulk rollback",
      );
    });
  });
});
