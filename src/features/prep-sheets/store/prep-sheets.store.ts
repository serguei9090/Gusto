import { create } from "zustand";
import { prepSheetsRepository } from "../services/prep-sheets.repository";
import type { PrepSheet, PrepSheetFormData } from "../types";

interface PrepSheetsState {
    // Data
    prepSheets: PrepSheet[];
    currentSheet: PrepSheet | null;
    isLoading: boolean;
    error: string | null;

    // Builder State
    builderSelections: { recipeId: number; servings: number }[];

    // Actions
    fetchPrepSheets: () => Promise<void>;
    generateSheet: (formData: PrepSheetFormData) => Promise<PrepSheet>;
    saveSheet: (sheet: PrepSheet) => Promise<number>;
    deleteSheet: (id: number) => Promise<void>;
    setCurrentSheet: (sheet: PrepSheet | null) => void;

    // Builder Actions
    addRecipeToBuilder: (recipeId: number, servings: number) => void;
    updateBuilderServings: (recipeId: number, servings: number) => void;
    removeRecipeFromBuilder: (recipeId: number) => void;
    clearBuilder: () => void;
}

export const usePrepSheetsStore = create<PrepSheetsState>((set, get) => ({
    prepSheets: [],
    currentSheet: null,
    isLoading: false,
    error: null,
    builderSelections: [],

    fetchPrepSheets: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await prepSheetsRepository.getAll();
            set({ prepSheets: data, isLoading: false });
        } catch (err) {
            set({ error: String(err), isLoading: false });
        }
    },

    generateSheet: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const sheet = await prepSheetsRepository.generate(formData);
            set({ currentSheet: sheet, isLoading: false });
            return sheet;
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },

    saveSheet: async (sheet) => {
        set({ isLoading: true, error: null });
        try {
            const id = await prepSheetsRepository.save(sheet);
            await get().fetchPrepSheets(); // Refresh
            return id;
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },

    deleteSheet: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await prepSheetsRepository.delete(id);
            await get().fetchPrepSheets();
        } catch (err) {
            set({ error: String(err), isLoading: false });
        }
    },

    setCurrentSheet: (sheet) => set({ currentSheet: sheet }),

    addRecipeToBuilder: (recipeId, servings) => {
        const { builderSelections } = get();
        const existing = builderSelections.find((s) => s.recipeId === recipeId);
        if (existing) {
            set({
                builderSelections: builderSelections.map((s) =>
                    s.recipeId === recipeId ? { ...s, servings } : s
                ),
            });
        } else {
            set({ builderSelections: [...builderSelections, { recipeId, servings }] });
        }
    },

    updateBuilderServings: (recipeId, servings) => {
        set({
            builderSelections: get().builderSelections.map((s) =>
                s.recipeId === recipeId ? { ...s, servings } : s
            ),
        });
    },

    removeRecipeFromBuilder: (recipeId) => {
        set({
            builderSelections: get().builderSelections.filter(
                (s) => s.recipeId !== recipeId
            ),
        });
    },

    clearBuilder: () => set({ builderSelections: [], currentSheet: null }),
}));
