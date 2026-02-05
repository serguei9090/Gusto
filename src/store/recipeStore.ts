import { create } from "zustand";
import { recipesService } from "@/services/recipes.service";
import type { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeCategory } from "@/types/ingredient.types";

interface RecipeStore {
    // State
    recipes: Recipe[];
    selectedRecipe: Recipe | null;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    categoryFilter: RecipeCategory | "all";

    // Actions
    fetchRecipes: () => Promise<void>;
    createRecipe: (data: CreateRecipeInput) => Promise<Recipe>;
    updateRecipe: (id: number, data: UpdateRecipeInput) => Promise<void>;
    deleteRecipe: (id: number) => Promise<void>;
    selectRecipe: (recipe: Recipe | null) => void;
    setSearchQuery: (query: string) => void;
    setCategoryFilter: (category: RecipeCategory | "all") => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
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
            const recipes = await recipesService.getAll();
            set({ recipes, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch recipes",
                isLoading: false
            });
        }
    },

    createRecipe: async (data: CreateRecipeInput & { ingredients?: { ingredientId: number, quantity: number, unit: string }[] }) => {
        set({ isLoading: true, error: null });
        try {
            let newRecipe;
            if (data.ingredients && data.ingredients.length > 0) {
                newRecipe = await recipesService.createFull(data as any);
            } else {
                newRecipe = await recipesService.create(data);
            }

            set((state) => ({
                recipes: [...state.recipes, newRecipe],
                isLoading: false
            }));
            return newRecipe;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to create recipe",
                isLoading: false
            });
            throw error;
        }
    },

    updateRecipe: async (id: number, data: UpdateRecipeInput) => {
        set({ isLoading: true, error: null });
        try {
            await recipesService.update(id, data);

            // Refresh logic: Optimistic or re-fetch?
            // Re-fetch since cost calculations involve backend logic triggers
            const recipes = await recipesService.getAll();

            set((state) => ({
                recipes,
                // Update selected if applicable (though selected requires detailed fetch)
                selectedRecipe: state.selectedRecipe?.id === id ? { ...state.selectedRecipe, ...data } as Recipe : state.selectedRecipe,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to update recipe",
                isLoading: false
            });
            throw error;
        }
    },

    deleteRecipe: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await recipesService.delete(id);
            set((state) => ({
                recipes: state.recipes.filter(r => r.id !== id),
                selectedRecipe: state.selectedRecipe?.id === id ? null : state.selectedRecipe,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to delete recipe",
                isLoading: false
            });
            throw error;
        }
    },

    selectRecipe: (recipe) => set({ selectedRecipe: recipe }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategoryFilter: (category) => set({ categoryFilter: category }),
}));
