import { create } from "zustand";
import { supplierService, type CreateSupplierInput, type UpdateSupplierInput } from "@/services/suppliers.service";
import type { Supplier } from "@/types/ingredient.types";

interface SupplierStore {
    suppliers: Supplier[];
    isLoading: boolean;
    error: string | null;

    fetchSuppliers: () => Promise<void>;
    createSupplier: (data: CreateSupplierInput) => Promise<void>;
    updateSupplier: (id: number, data: UpdateSupplierInput) => Promise<void>;
    deleteSupplier: (id: number) => Promise<void>;
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
    suppliers: [],
    isLoading: false,
    error: null,

    fetchSuppliers: async () => {
        set({ isLoading: true, error: null });
        try {
            const suppliers = await supplierService.getAll();
            set({ suppliers, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch suppliers",
                isLoading: false
            });
        }
    },

    createSupplier: async (data: CreateSupplierInput) => {
        set({ isLoading: true, error: null });
        try {
            await supplierService.create(data);
            await get().fetchSuppliers();
            set({ isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to create supplier",
                isLoading: false
            });
            throw error;
        }
    },

    updateSupplier: async (id: number, data: UpdateSupplierInput) => {
        set({ isLoading: true, error: null });
        try {
            await supplierService.update(id, data);
            await get().fetchSuppliers();
            set({ isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to update supplier",
                isLoading: false
            });
            throw error;
        }
    },

    deleteSupplier: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await supplierService.delete(id);
            await get().fetchSuppliers();
            set({ isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to delete supplier",
                isLoading: false
            });
            throw error;
        }
    }
}));
