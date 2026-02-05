import { create } from "zustand";
import { prepSheetService } from "@/services/prepSheet.service";
import type { PrepSheet, PrepSheetFormData } from "@/types/prepSheet.types";

interface PrepSheetStore {
    // State
    prepSheets: PrepSheet[];
    currentSheet: PrepSheet | null;
    isLoading: boolean;
    error: string | null;

    // Builder state
    builderSelections: { recipeId: number; servings: number }[];

    // Actions
    fetchPrepSheets: () => Promise<void>;
    generateSheet: (formData: PrepSheetFormData) => Promise<PrepSheet>;
    saveSheet: (sheet: PrepSheet) => Promise<number>;
    deleteSheet: (id: number) => Promise<void>;
    setCurrentSheet: (sheet: PrepSheet | null) => void;

    // Builder actions
    addRecipeToBuilder: (recipeId: number, servings: number) => void;
    updateBuilderServings: (recipeId: number, servings: number) => void;
    removeRecipeFromBuilder: (recipeId: number) => void;
    clearBuilder: () => void;
}

export const usePrepSheetStore = create<PrepSheetStore>((set, get) => ({
    // Initial state
    prepSheets: [],
    currentSheet: null,
    isLoading: false,
    error: null,
    builderSelections: [],

    // Actions
    fetchPrepSheets: async () => {
        set({ isLoading: true, error: null });
        try {
            const sheets = await prepSheetService.getAll();
            set({ prepSheets: sheets, isLoading: false });
        } catch (err) {
            set({ error: String(err), isLoading: false });
        }
    },

    generateSheet: async (formData: PrepSheetFormData) => {
        set({ isLoading: true, error: null });
        try {
            const sheet = await prepSheetService.generate(formData);
            set({ currentSheet: sheet, isLoading: false });
            return sheet;
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },

    saveSheet: async (sheet: PrepSheet) => {
        set({ isLoading: true, error: null });
        try {
            const id = await prepSheetService.save(sheet);
            // Refresh list
            const sheets = await prepSheetService.getAll();
            set({ prepSheets: sheets, isLoading: false });
            return id;
        } catch (err) {
            set({ error: String(err), isLoading: false });
            throw err;
        }
    },

    deleteSheet: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await prepSheetService.delete(id);
            const sheets = await prepSheetService.getAll();
            set({ prepSheets: sheets, isLoading: false });
        } catch (err) {
            set({ error: String(err), isLoading: false });
        }
    },

    setCurrentSheet: (sheet) => set({ currentSheet: sheet }),

    // Builder actions
    addRecipeToBuilder: (recipeId, servings) => {
        const existing = get().builderSelections.find(s => s.recipeId === recipeId);
        if (existing) {
            // Update servings if already exists
            set({
                builderSelections: get().builderSelections.map(s =>
                    s.recipeId === recipeId ? { ...s, servings } : s
                )
            });
        } else {
            set({ builderSelections: [...get().builderSelections, { recipeId, servings }] });
        }
    },

    updateBuilderServings: (recipeId, servings) => {
        set({
            builderSelections: get().builderSelections.map(s =>
                s.recipeId === recipeId ? { ...s, servings } : s
            )
        });
    },

    removeRecipeFromBuilder: (recipeId) => {
        set({
            builderSelections: get().builderSelections.filter(s => s.recipeId !== recipeId)
        });
    },

    clearBuilder: () => set({ builderSelections: [], currentSheet: null })
}));
