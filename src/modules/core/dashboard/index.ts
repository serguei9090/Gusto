import { LayoutDashboard } from "lucide-react";
import React from "react";
import type { ModuleDefinition } from "@/types/module";
import { dashboardRegistry } from "./registry";
import {
  InventoryValueWidget,
  LowStockWidget,
} from "./widgets/InventoryWidgets";
import { TopRecipesWidget, UrgentReordersWidget } from "./widgets/MainWidgets";
import { ActiveRecipesWidget, AvgMarginWidget } from "./widgets/RecipeWidgets";

const DashboardPage = React.lazy(() =>
  import("./components/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);

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
    dashboardRegistry.clear();

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
      colSpan: 2,
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
