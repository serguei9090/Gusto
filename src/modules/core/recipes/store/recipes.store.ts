import { create } from "zustand";
import type {
  CreateRecipeInput,
  Recipe,
  RecipeWithIngredients,
  UpdateRecipeInput,
} from "@/types/ingredient.types";
import { recipesRepository } from "../services/recipes.repository";
import { recipeVersionRepository } from "../services/recipeVersion.repository";

interface RecipeStore {
  // State
  recipes: Recipe[];
  selectedRecipe: RecipeWithIngredients | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: string | "all";

  // Actions
  fetchRecipes: () => Promise<void>;
  fetchFullRecipe: (id: number) => Promise<void>;
  createRecipe: (
    data: CreateRecipeInput & {
      ingredients?: {
        ingredientId: number | null;
        subRecipeId?: number | null;
        quantity: number;
        unit: string;
      }[];
    },
  ) => Promise<Recipe>;
  updateRecipe: (id: number, data: UpdateRecipeInput) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
  selectRecipe: (recipe: RecipeWithIngredients | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | "all") => void;
  createExperiment: (
    recipeId: number,
    experimentName: string,
  ) => Promise<Recipe>;
  applyExperimentToParent: (experimentId: number) => Promise<void>;
  bulkRollback: (date: string, reason?: string) => Promise<number>;
}

export const useRecipeStore = create<RecipeStore>((set, _get) => ({
  // Initial State
  recipes: [],
  selectedRecipe: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  categoryFilter: "all",

  // Actions
  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const recipes = await recipesRepository.getAll();
      set({ recipes, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch recipes",
        isLoading: false,
      });
    }
  },

  fetchFullRecipe: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const selectedRecipe = await recipesRepository.getById(id);
      set({ selectedRecipe, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recipe details",
        isLoading: false,
      });
    }
  },

  createRecipe: async (data) => {
    set({ isLoading: true, error: null });
    try {
      let newRecipe: Recipe;
      if (data.ingredients && data.ingredients.length > 0) {
        newRecipe = await recipesRepository.createFull({
          ...data,
          ingredients: data.ingredients,
        });
      } else {
        newRecipe = await recipesRepository.create(data);
      }

      set((state) => ({
        recipes: [...state.recipes, newRecipe],
        isLoading: false,
      }));
      return newRecipe;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create recipe",
        isLoading: false,
      });
      throw error;
    }
  },

  updateRecipe: async (id: number, data: UpdateRecipeInput) => {
    set({ isLoading: true, error: null });
    try {
      await recipesRepository.update(id, data);

      // Create a new version snapshot
      await recipeVersionRepository.createVersion({
        recipeId: id,
        changeNotes: data.changeNotes || "Updated via application",
        createdBy: "user", // TODO: Replace with actual user when auth is implemented
      });

      // Re-fetch since cost calculations involve backend logic triggers
      const recipes = await recipesRepository.getAll();

      // If the currently selected recipe was just updated, refresh its details
      let updatedSelectedRecipe = _get().selectedRecipe;
      if (updatedSelectedRecipe?.id === id) {
        updatedSelectedRecipe = await recipesRepository.getById(id);
      }

      set({
        recipes,
        selectedRecipe: updatedSelectedRecipe,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update recipe",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteRecipe: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await recipesRepository.delete(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        selectedRecipe:
          state.selectedRecipe?.id === id ? null : state.selectedRecipe,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete recipe",
        isLoading: false,
      });
      throw error;
    }
  },

  selectRecipe: (recipe: RecipeWithIngredients | null) =>
    set({ selectedRecipe: recipe }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setCategoryFilter: (category: string | "all") =>
    set({ categoryFilter: category }),

  createExperiment: async (recipeId: number, experimentName: string) => {
    set({ isLoading: true, error: null });
    try {
      const newRecipe = await recipesRepository.createExperiment(
        recipeId,
        experimentName,
      );
      set((state) => ({
        recipes: [...state.recipes, newRecipe],
        isLoading: false,
      }));
      return newRecipe;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create experiment",
        isLoading: false,
      });
      throw error;
    }
  },

  applyExperimentToParent: async (experimentId: number) => {
    set({ isLoading: true, error: null });
    try {
      await recipesRepository.applyExperimentToParent(experimentId);

      // Re-fetch all since parent was updated
      const recipes = await recipesRepository.getAll();

      // If the parent was selected, refresh its details (unlikely in this context but for safety)
      const selected = _get().selectedRecipe;
      const updatedSelected =
        selected && recipes.some((r) => r.id === selected.id)
          ? await recipesRepository.getById(selected.id)
          : selected;

      set({
        recipes,
        selectedRecipe: updatedSelected,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to apply experiment to original",
        isLoading: false,
      });
      throw error;
    }
  },

  bulkRollback: async (date: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const count = await recipeVersionRepository.bulkRollbackToDate(
        date,
        reason,
      );

      // Refresh all recipes
      const recipes = await recipesRepository.getAll();
      set({
        recipes,
        selectedRecipe: null, // Clear selection to be safe
        isLoading: false,
      });

      return count;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to perform bulk rollback",
        isLoading: false,
      });
      throw error;
    }
  },
}));
