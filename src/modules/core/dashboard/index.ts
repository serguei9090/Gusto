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
};
