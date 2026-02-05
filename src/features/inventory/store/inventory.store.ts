import { create } from "zustand";
import { inventoryRepository } from "../services/inventory.repository";
import type { CreateTransactionInput, InventoryTransaction } from "../types";
import { useIngredientsStore } from "@/features/ingredients/store/ingredients.store";

interface InventoryStore {
    transactions: InventoryTransaction[];
    lowStockItems: any[];
    isLoading: boolean;
    error: string | null;

    fetchTransactions: (limit?: number) => Promise<void>;
    fetchLowStockItems: () => Promise<void>;
    logTransaction: (data: CreateTransactionInput) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
    transactions: [],
    lowStockItems: [],
    isLoading: false,
    error: null,

    fetchTransactions: async (limit = 50) => {
        set({ isLoading: true, error: null });
        try {
            const transactions = await inventoryRepository.getAllTransactions(limit);
            set({ transactions, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to fetch transactions",
                isLoading: false
            });
        }
    },

    fetchLowStockItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const lowStockItems = await inventoryRepository.getLowStockItems();
            set({ lowStockItems, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch low stock items:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to fetch low stock items",
                isLoading: false
            });
        }
    },

    logTransaction: async (data: CreateTransactionInput) => {
        set({ isLoading: true, error: null });
        try {
            await inventoryRepository.logTransaction(data);

            // Re-fetch transactions
            await get().fetchTransactions();

            // Refresh ingredients in the main store to reflect stock changes
            // Note: This dependency requires useIngredientStore to be available/migrated
            await useIngredientsStore.getState().fetchIngredients();

            // Refresh low stock items
            await get().fetchLowStockItems();

            set({ isLoading: false });
        } catch (error) {
            console.error("Failed to log transaction:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to log transaction",
                isLoading: false
            });
            throw error;
        }
    }
}));
