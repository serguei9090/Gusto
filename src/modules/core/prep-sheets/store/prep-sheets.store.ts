import { createModuleStore } from "@/lib/store";
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
  builderFields: {
    name: string;
    date: string;
    shift: "morning" | "evening" | "";
    prepCookName: string;
    notes: string;
  };

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
  setBuilderField: (field: string, value: string | number | boolean) => void;
  clearBuilder: () => void;

  // UI State
  notification: { message: string; type: "success" | "error" } | null;
  clearNotification: () => void;
}

const INITIAL_FIELDS = {
  name: "",
  date: new Date().toISOString().split("T")[0],
  shift: "" as const,
  prepCookName: "",
  notes: "",
};

export const usePrepSheetsStore = createModuleStore<PrepSheetsState>(
  { name: "prep-sheets" },
  (set, get) => ({
    prepSheets: [],
    currentSheet: null,
    isLoading: false,
    error: null,
    builderSelections: [],
    builderFields: INITIAL_FIELDS,
    notification: null,

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
        set({
          notification: {
            message: "Prep sheet saved successfully!",
            type: "success",
          },
        });
        return id;
      } catch (err) {
        set({
          error: String(err),
          notification: {
            message: "Failed to save prep sheet",
            type: "error",
          },
          isLoading: false,
        });
        throw err;
      }
    },

    deleteSheet: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await prepSheetsRepository.delete(id);
        await get().fetchPrepSheets();
        set({
          notification: {
            message: "Prep sheet deleted",
            type: "success",
          },
        });
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
            s.recipeId === recipeId ? { ...s, servings } : s,
          ),
        });
      } else {
        set({
          builderSelections: [...builderSelections, { recipeId, servings }],
        });
      }
    },

    updateBuilderServings: (recipeId, servings) => {
      set({
        builderSelections: get().builderSelections.map((s) =>
          s.recipeId === recipeId ? { ...s, servings } : s,
        ),
      });
    },

    removeRecipeFromBuilder: (recipeId) => {
      set({
        builderSelections: get().builderSelections.filter(
          (s) => s.recipeId !== recipeId,
        ),
      });
    },

    setBuilderField: (field, value) => {
      set((state) => ({
        builderFields: {
          ...state.builderFields,
          [field]: value,
        },
      }));
    },

    clearBuilder: () =>
      set({
        builderSelections: [],
        builderFields: INITIAL_FIELDS,
        currentSheet: null,
      }),

    clearNotification: () => set({ notification: null }),
  }),
);
