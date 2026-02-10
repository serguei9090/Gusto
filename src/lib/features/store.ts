import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FeatureFlagsState {
  flags: Record<string, boolean>;
  setFlag: (key: string, enabled: boolean) => void;
  isEnabled: (key: string) => boolean;
  toggleFlag: (key: string) => void;
}

export const useFeatureStore = create<FeatureFlagsState>()(
  persist(
    (set, get) => ({
      flags: {
        // Default flags
        "experimental-features": false,
        "new-inventory-ui": false,
      },
      setFlag: (key, enabled) =>
        set((state) => ({
          flags: { ...state.flags, [key]: enabled },
        })),
      isEnabled: (key) => {
        const state = get();
        return state.flags[key] ?? false;
      },
      toggleFlag: (key) =>
        set((state) => ({
          flags: { ...state.flags, [key]: !state.flags[key] },
        })),
    }),
    {
      name: "gusto-features",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
