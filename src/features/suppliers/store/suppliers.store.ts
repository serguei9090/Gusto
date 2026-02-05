import { create } from "zustand";
import { suppliersRepository, type CreateSupplierInput, type UpdateSupplierInput } from "../services/suppliers.repository";
import type { Supplier } from "../types";

interface SuppliersState {
    suppliers: Supplier[];
    isLoading: boolean;
    error: string | null;

    fetchSuppliers: () => Promise<void>;
    createSupplier: (data: Omit<CreateSupplierInput, 'id'>) => Promise<void>;
    updateSupplier: (id: number, data: UpdateSupplierInput) => Promise<void>;
    deleteSupplier: (id: number) => Promise<void>;
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
    suppliers: [],
    isLoading: false,
    error: null,

    fetchSuppliers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await suppliersRepository.getAll();
            set({ suppliers: data, isLoading: false });
        } catch (err) {
            set({ error: String(err), isLoading: false });
        }
    },

    createSupplier: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await suppliersRepository.create(data);
            await get().fetchSuppliers();
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },

    updateSupplier: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await suppliersRepository.update(id, data);
            await get().fetchSuppliers();
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },

    deleteSupplier: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await suppliersRepository.delete(id);
            await get().fetchSuppliers();
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },
}));
