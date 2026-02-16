import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WidgetPreference {
  visible: boolean;
  order: number;
}

interface DashboardConfigStore {
  preferences: Record<string, WidgetPreference>;

  // Actions
  setWidgetVisibility: (id: string, visible: boolean) => void;
  setWidgetOrder: (orderedIds: string[]) => void;
  // Initialize preferences for new widgets that don't have them yet
  initWidgetPreferences: (widgets: { id: string; order: number }[]) => void;
}

export const useDashboardConfigStore = create<DashboardConfigStore>()(
  persist(
    (set) => ({
      preferences: {},

      setWidgetVisibility: (id, visible) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [id]: {
              ...(state.preferences[id] || { order: 999 }),
              visible,
            },
          },
        })),

      setWidgetOrder: (orderedIds) =>
        set((state) => {
          const newPreferences = { ...state.preferences };
          orderedIds.forEach((id, index) => {
            newPreferences[id] = {
              ...(newPreferences[id] || { visible: true }),
              order: index,
            };
          });
          return { preferences: newPreferences };
        }),

      initWidgetPreferences: (widgets) =>
        set((state) => {
          const newPreferences = { ...state.preferences };
          let hasChanges = false;

          widgets.forEach((widget) => {
            if (!newPreferences[widget.id]) {
              newPreferences[widget.id] = {
                visible: true,
                order: widget.order,
              };
              hasChanges = true;
            }
          });

          return hasChanges ? { preferences: newPreferences } : {};
        }),
    }),
    {
      name: "dashboard-config-storage",
    },
  ),
);
