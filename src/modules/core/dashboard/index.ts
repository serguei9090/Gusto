import { LayoutDashboard } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { DashboardPage } from "./components/DashboardPage";

export * from "./components/DashboardPage";

export const dashboardModule: ModuleDefinition = {
  id: "dashboard",
  title: "Dashboard",
  icon: LayoutDashboard,
  component: DashboardPage,
  order: 5,
  isCore: true,
  description: "Overview of your restaurant performance",
  init: async () => {
    // Register default widgets
    const { dashboardRegistry } = await import("./registry");
    dashboardRegistry.clear();
    const { InventoryValueWidget, LowStockWidget } = await import(
      "./widgets/InventoryWidgets"
    );
    const { AvgMarginWidget, ActiveRecipesWidget } = await import(
      "./widgets/RecipeWidgets"
    );
    const { UrgentReordersWidget, TopRecipesWidget } = await import(
      "./widgets/MainWidgets"
    );

    dashboardRegistry.register({
      id: "inventory-value",
      component: InventoryValueWidget,
      colSpan: 1,
      order: 10,
    });
    dashboardRegistry.register({
      id: "low-stock",
      component: LowStockWidget,
      colSpan: 1,
      order: 20,
    });
    dashboardRegistry.register({
      id: "avg-margin",
      component: AvgMarginWidget,
      colSpan: 1,
      order: 30,
    });
    dashboardRegistry.register({
      id: "active-recipes",
      component: ActiveRecipesWidget,
      colSpan: 1,
      order: 40,
    });

    // Row 2
    dashboardRegistry.register({
      id: "urgent-reorders",
      component: UrgentReordersWidget,
      colSpan: 2, // Takes up 2 columns out of 4 (approx half) or 2/3rds in a 3-col layout
      order: 50,
    });
    dashboardRegistry.register({
      id: "top-recipes",
      component: TopRecipesWidget,
      colSpan: 2,
      order: 60,
    });
  },
};
