import { create } from "zustand";
import { inventoryService, type CreateTransactionInput } from "@/services/inventory.service";
import type { InventoryTransaction } from "@/types/ingredient.types";
import { useIngredientStore } from "./ingredientStore";

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
            const transactions = await inventoryService.getAllTransactions(limit);
            set({ transactions, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch transactions",
                isLoading: false
            });
        }
    },

    fetchLowStockItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const lowStockItems = await inventoryService.getLowStockItems();
            set({ lowStockItems, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch low stock items",
                isLoading: false
            });
        }
    },

    logTransaction: async (data: CreateTransactionInput) => {
        set({ isLoading: true, error: null });
        try {
            await inventoryService.logTransaction(data);

            // Re-fetch transactions
            await get().fetchTransactions();

            // IMPORTANT: Re-fetch ingredients to update their currentStock in the UI
            await useIngredientStore.getState().fetchIngredients();

            // Also update low stock items
            await get().fetchLowStockItems();

            set({ isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to log transaction",
                isLoading: false
            });
            throw error;
        }
    }
}));
