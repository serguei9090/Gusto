import { create } from "zustand";
import { dashboardService, type DashboardSummary, type UrgentReorderItem } from "@/services/dashboard.service";

interface DashboardStore {
    summary: DashboardSummary | null;
    urgentReorders: UrgentReorderItem[];
    topRecipes: any[];
    isLoading: boolean;
    error: string | null;

    fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    summary: null,
    urgentReorders: [],
    topRecipes: [],
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            const [summary, urgentReorders, topRecipes] = await Promise.all([
                dashboardService.getSummary(),
                dashboardService.getUrgentReorders(),
                dashboardService.getTopRecipes()
            ]);

            set({
                summary,
                urgentReorders,
                topRecipes,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to load dashboard",
                isLoading: false
            });
        }
    }
}));
