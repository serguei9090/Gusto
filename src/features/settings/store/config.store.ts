import { create } from "zustand";
import {
  type ConfigItem,
  configRepository,
} from "../services/config.repository";

interface ConfigState {
  items: ConfigItem[];
  isLoading: boolean;
  error: string | null;

  loadConfig: () => Promise<void>;
  addItem: (type: ConfigItem["type"], name: string) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  restoreDefaults: (type: ConfigItem["type"]) => Promise<void>;
  reorder: (items: ConfigItem[]) => Promise<void>;

  // Helpers to get specific types
  getUnits: () => string[];
  getIngredientCategories: () => string[];
  getRecipeCategories: () => string[];
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await configRepository.getAll();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addItem: async (type, name) => {
    try {
      await configRepository.add(type, name);
      const items = await configRepository.getAll();
      set({ items });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeItem: async (id) => {
    try {
      await configRepository.delete(id);
      const items = await configRepository.getAll();
      set({ items });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  restoreDefaults: async (type) => {
    try {
      await configRepository.restoreDefaults(type);
      const items = await configRepository.getAll();
      set({ items });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  reorder: async (reorderedItems) => {
    // Optimistic update
    const type = reorderedItems[0]?.type;
    if (!type) return;

    // Get currently loaded items
    const currentItems = get().items;

    // Filter out items of this type from the current list
    const otherItems = currentItems.filter((i) => i.type !== type);

    // Combine other items with the new reordered list
    set({ items: [...otherItems, ...reorderedItems] });

    try {
      await configRepository.reorder(reorderedItems.map((i) => i.id));
    } catch (error) {
      // Revert on error by reloading from DB
      set({ error: (error as Error).message });
      const items = await configRepository.getAll();
      set({ items });
    }
  },

  getUnits: () => {
    return get()
      .items.filter((i) => i.type.startsWith("unit"))
      .map((i) => i.name);
  },

  getIngredientCategories: () => {
    return Array.from(
      new Set(
        get()
          .items.filter((i) => i.type === "ingredient_category")
          .map((i) => i.name),
      ),
    );
  },

  getRecipeCategories: () => {
    return Array.from(
      new Set(
        get()
          .items.filter((i) => i.type === "recipe_category")
          .map((i) => i.name),
      ),
    );
  },
}));
