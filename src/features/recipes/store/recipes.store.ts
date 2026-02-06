import { create } from "zustand";
import type {
  CreateRecipeInput,
  Recipe,
  RecipeCategory,
  RecipeWithIngredients,
  UpdateRecipeInput,
} from "@/types/ingredient.types";
import { recipesRepository } from "../services/recipes.repository";

interface RecipeStore {
  // State
  recipes: Recipe[];
  selectedRecipe: RecipeWithIngredients | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: RecipeCategory | "all";

  // Actions
  fetchRecipes: () => Promise<void>;
  fetchFullRecipe: (id: number) => Promise<void>;
  createRecipe: (
    data: CreateRecipeInput & {
      ingredients?: { ingredientId: number; quantity: number; unit: string }[];
    },
  ) => Promise<Recipe>;
  updateRecipe: (id: number, data: UpdateRecipeInput) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
  selectRecipe: (recipe: RecipeWithIngredients | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: RecipeCategory | "all") => void;
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

      // Re-fetch since cost calculations involve backend logic triggers
      const recipes = await recipesRepository.getAll();

      set((state) => ({
        recipes,
        // If the updated recipe was the selected one, clear it to force a re-fetch of details if needed
        selectedRecipe:
          state.selectedRecipe?.id === id ? null : state.selectedRecipe,
        isLoading: false,
      }));
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

  selectRecipe: (recipe) => set({ selectedRecipe: recipe }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
}));
