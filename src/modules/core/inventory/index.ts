import { Package } from "lucide-react";
import { InventoryPage } from "@/components/pages/InventoryPage/InventoryPage";
import type { ModuleDefinition } from "@/types/module";

export { InventoryPage };

export const inventoryModule: ModuleDefinition = {
  id: "inventory",
  title: "Inventory",
  icon: Package,
  component: InventoryPage,
  order: 30,
  isCore: true,
  description: "Track stock levels and transactions",
};
