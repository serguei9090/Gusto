import { create } from "zustand";
import type { Ingredient, CreateIngredientInput, UpdateIngredientInput, IngredientCategory } from "@/types/ingredient.types";
import { ingredientService } from "@/services/ingredients.service";

interface IngredientStore {
    // State
    ingredients: Ingredient[];
    selectedIngredient: Ingredient | null;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    categoryFilter: IngredientCategory | "all";

    // Actions
    fetchIngredients: () => Promise<void>;
    createIngredient: (data: CreateIngredientInput) => Promise<void>;
    updateIngredient: (id: number, data: UpdateIngredientInput) => Promise<void>;
    deleteIngredient: (id: number) => Promise<void>;
    selectIngredient: (ingredient: Ingredient | null) => void;
    setSearchQuery: (query: string) => void;
    setCategoryFilter: (category: IngredientCategory | "all") => void;
    getLowStockIngredients: () => Promise<void>;
}

export const useIngredientStore = create<IngredientStore>((set) => ({
    // Initial state
    ingredients: [],
    selectedIngredient: null,
    isLoading: false,
    error: null,
    searchQuery: "",
    categoryFilter: "all",

    // Fetch all ingredients
    fetchIngredients: async () => {
        set({ isLoading: true, error: null });
        try {
            const ingredients = await ingredientService.getAll();
            set({ ingredients, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch ingredients",
                isLoading: false,
            });
        }
    },

    // Create new ingredient
    createIngredient: async (data: CreateIngredientInput) => {
        set({ isLoading: true, error: null });
        try {
            const newIngredient = await ingredientService.create(data);
            set((state) => ({
                ingredients: [...state.ingredients, newIngredient],
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to create ingredient",
                isLoading: false,
            });
            throw error;
        }
    },

    // Update ingredient
    updateIngredient: async (id: number, data: UpdateIngredientInput) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await ingredientService.update(id, data);
            if (updated) {
                set((state) => ({
                    ingredients: state.ingredients.map((ing) =>
                        ing.id === id ? updated : ing
                    ),
                    selectedIngredient:
                        state.selectedIngredient?.id === id ? updated : state.selectedIngredient,
                    isLoading: false,
                }));
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to update ingredient",
                isLoading: false,
            });
            throw error;
        }
    },

    // Delete ingredient
    deleteIngredient: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await ingredientService.delete(id);
            set((state) => ({
                ingredients: state.ingredients.filter((ing) => ing.id !== id),
                selectedIngredient:
                    state.selectedIngredient?.id === id ? null : state.selectedIngredient,
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to delete ingredient",
                isLoading: false,
            });
            throw error;
        }
    },

    // Select ingredient for editing/viewing
    selectIngredient: (ingredient: Ingredient | null) => {
        set({ selectedIngredient: ingredient });
    },

    // Set search query
    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    // Set category filter
    setCategoryFilter: (category: IngredientCategory | "all") => {
        set({ categoryFilter: category });
    },

    // Get low stock ingredients
    getLowStockIngredients: async () => {
        set({ isLoading: true, error: null });
        try {
            const lowStock = await ingredientService.getLowStock();
            set({ ingredients: lowStock, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch low stock",
                isLoading: false,
            });
        }
    },
}));
