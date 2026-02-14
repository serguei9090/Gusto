import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/types/asset.types";
import { assetsRepository } from "../services/assets.repository";

interface AssetsStore {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  fetchAssets: () => Promise<void>;
  createAsset: (data: CreateAssetInput) => Promise<void>;
  updateAsset: (id: number, data: UpdateAssetInput) => Promise<void>;
  deleteAsset: (id: number) => Promise<void>;
  archiveAsset: (id: number) => Promise<void>;
  searchAssets: (query: string) => Promise<void>;
  getLowStockAssets: () => Promise<void>;
}

export const useAssetsStore = create<AssetsStore>()(
  devtools(
    (set) => ({
      assets: [],
      isLoading: false,
      error: null,

      fetchAssets: async () => {
        set({ isLoading: true, error: null });
        try {
          const assets = await assetsRepository.getAll();
          set({ assets, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch assets",
            isLoading: false,
          });
        }
      },

      createAsset: async (data: CreateAssetInput) => {
        set({ isLoading: true, error: null });
        try {
          const newAsset = await assetsRepository.create(data);
          set((state) => ({
            assets: [...state.assets, newAsset],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create asset",
            isLoading: false,
          });
          throw error;
        }
      },

      updateAsset: async (id: number, data: UpdateAssetInput) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAsset = await assetsRepository.update(id, data);
          if (updatedAsset) {
            set((state) => ({
              assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
              isLoading: false,
            }));
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update asset",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteAsset: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await assetsRepository.delete(id);
          set((state) => ({
            assets: state.assets.filter((a) => a.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete asset",
            isLoading: false,
          });
          throw error;
        }
      },

      archiveAsset: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await assetsRepository.archive(id);
          set((state) => ({
            assets: state.assets.filter((a) => a.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to archive asset",
            isLoading: false,
          });
          throw error;
        }
      },

      searchAssets: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const assets = await assetsRepository.search(query);
          set({ assets, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to search assets",
            isLoading: false,
          });
        }
      },

      getLowStockAssets: async () => {
        set({ isLoading: true, error: null });
        try {
          const assets = await assetsRepository.getLowStock();
          set({ assets, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to get low stock assets",
            isLoading: false,
          });
        }
      },
    }),
    { name: "AssetsStore" },
  ),
);
