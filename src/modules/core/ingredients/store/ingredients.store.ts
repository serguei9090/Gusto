import { create } from "zustand";
import { runWithHandling } from "@/utils/error-handler";
import { ingredientsRepository } from "../services/ingredients.repository";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../types";

interface IngredientsState {
  // Data (UI Mirror)
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchIngredients: () => Promise<void>;
  createIngredient: (data: CreateIngredientInput) => Promise<void>;
  updateIngredient: (id: number, data: UpdateIngredientInput) => Promise<void>;
  deleteIngredient: (id: number) => Promise<void>;
  archiveIngredient: (id: number) => Promise<void>;
  searchIngredients: (query: string) => Promise<void>;
}

export const useIngredientsStore = create<IngredientsState>((set, get) => ({
  ingredients: [],
  isLoading: false,
  error: null,

  fetchIngredients: async () => {
    set({ isLoading: true, error: null });
    await runWithHandling(
      "fetchIngredients",
      async () => {
        const data = await ingredientsRepository.getAll();
        set({ ingredients: data, isLoading: false });
      },
      (err) => set({ error: String(err), isLoading: false }),
    );
  },

  createIngredient: async (data) => {
    set({ isLoading: true, error: null });
    await runWithHandling(
      "createIngredient",
      async () => {
        await ingredientsRepository.create(data);
        // Sync: Re-fetch to ensure UI matches DB source of truth
        await get().fetchIngredients();
      },
      (err) => {
        set({ error: String(err), isLoading: false });
        throw err;
      },
    );
  },

  updateIngredient: async (id, data) => {
    set({ isLoading: true, error: null });
    await runWithHandling(
      "updateIngredient",
      async () => {
        await ingredientsRepository.update(id, data);
        await get().fetchIngredients();
      },
      (err) => {
        set({ error: String(err), isLoading: false });
        throw err;
      },
    );
  },

  deleteIngredient: async (id) => {
    set({ isLoading: true, error: null });
    await runWithHandling(
      "deleteIngredient",
      async () => {
        await ingredientsRepository.delete(id);
        await get().fetchIngredients();
      },
      (err) => {
        set({ error: String(err), isLoading: false });
        throw err;
      },
    );
  },

  archiveIngredient: async (id) => {
    set({ isLoading: true, error: null });
    await runWithHandling(
      "archiveIngredient",
      async () => {
        await ingredientsRepository.archive(id);
        await get().fetchIngredients();
      },
      (err) => {
        set({ error: String(err), isLoading: false });
        throw err;
      },
    );
  },

  searchIngredients: async (query) => {
    set({ isLoading: true, error: null });
    await runWithHandling(
      "searchIngredients",
      async () => {
        if (!query.trim()) {
          await get().fetchIngredients();
          return;
        }
        const data = await ingredientsRepository.search(query);
        set({ ingredients: data, isLoading: false });
      },
      (err) => set({ error: String(err), isLoading: false }),
    );
  },
}));
