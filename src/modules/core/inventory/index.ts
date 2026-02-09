import { Package } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { InventoryPage } from "./components/InventoryPage";

export * from "./components/InventoryPage";

export const inventoryModule: ModuleDefinition = {
  id: "inventory",
  title: "Inventory",
  icon: Package,
  component: InventoryPage,
  order: 30,
  isCore: true,
  description: "Track stock levels and transactions",
};
