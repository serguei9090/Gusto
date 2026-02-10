import { createModuleStore } from "@/lib/store";
import { dashboardRepository } from "../services/dashboard.repository";
import type {
  DashboardSummary,
  TopRecipeItem,
  UrgentReorderItem,
} from "../types";

interface DashboardStore {
  summary: DashboardSummary | null;
  urgentReorders: UrgentReorderItem[];
  topRecipes: TopRecipeItem[];
  isLoading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = createModuleStore<DashboardStore>(
  { name: "dashboard" },
  (set) => ({
    summary: null,
    urgentReorders: [],
    topRecipes: [],
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
      set({ isLoading: true, error: null });
      try {
        const [summary, urgentReorders, topRecipes] = await Promise.all([
          dashboardRepository.getSummary(),
          dashboardRepository.getUrgentReorders(),
          dashboardRepository.getTopRecipes(),
        ]);

        set({
          summary,
          urgentReorders,
          topRecipes,
          isLoading: false,
        });
      } catch (err) {
        set({
          error:
            err instanceof Error
              ? err.message
              : "Failed to load dashboard data",
          isLoading: false,
        });
      }
    },
  }),
);
