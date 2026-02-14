import { createModuleStore } from "@/lib/store";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import type { Ingredient } from "@/types/ingredient.types";
import type { InventoryTransactionInput } from "@/utils/validators";
import { inventoryRepository } from "../services/inventory.repository";
import type { InventoryTransaction } from "../types";
import { useAssetsStore } from "./assets.store";

interface InventoryStore {
  transactions: InventoryTransaction[];
  lowStockItems: Ingredient[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (limit?: number) => Promise<void>;
  fetchLowStockItems: () => Promise<void>;
  logTransaction: (data: InventoryTransactionInput) => Promise<void>;
}

export const useInventoryStore = createModuleStore<InventoryStore>(
  { name: "inventory" },
  (set, get) => ({
    transactions: [],
    lowStockItems: [],
    isLoading: false,
    error: null,

    fetchTransactions: async (limit = 50) => {
      set({ isLoading: true, error: null });
      try {
        const transactions =
          await inventoryRepository.getAllTransactions(limit);
        set({ transactions, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch transactions",
          isLoading: false,
        });
      }
    },

    fetchLowStockItems: async () => {
      set({ isLoading: true, error: null });
      try {
        const lowStockItems =
          (await inventoryRepository.getLowStockItems()) as unknown as Ingredient[];
        set({ lowStockItems, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch low stock items:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch low stock items",
          isLoading: false,
        });
      }
    },

    logTransaction: async (data) => {
      set({ isLoading: true, error: null });
      try {
        await inventoryRepository.logTransaction(data);

        // Re-fetch transactions
        await get().fetchTransactions();

        // Refresh the appropriate store based on item type
        if (data.itemType === "asset" || data.assetId) {
          await useAssetsStore.getState().fetchAssets();
        } else {
          await useIngredientsStore.getState().fetchIngredients();
        }

        // Refresh low stock items
        await get().fetchLowStockItems();

        set({ isLoading: false });
      } catch (error) {
        console.error("Failed to log transaction:", error);
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to log transaction",
          isLoading: false,
        });
        throw error;
      }
    },
  }),
);
