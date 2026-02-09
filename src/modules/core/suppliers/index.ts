import { Users } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { SuppliersPage } from "./components/SuppliersPage";

export * from "./components/SuppliersPage";

export const suppliersModule: ModuleDefinition = {
  id: "suppliers",
  title: "Suppliers",
  icon: Users,
  component: SuppliersPage,
  order: 40,
  isCore: true,
  description: "Directory of suppliers and contact info",
};
