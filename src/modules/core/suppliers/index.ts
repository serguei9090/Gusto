import { Users } from "lucide-react";
import { SuppliersPage } from "@/components/pages/SuppliersPage/SuppliersPage";
import type { ModuleDefinition } from "@/types/module";

export * from "@/components/pages/SuppliersPage/SuppliersPage";

export const suppliersModule: ModuleDefinition = {
  id: "suppliers",
  title: "Suppliers",
  icon: Users,
  component: SuppliersPage,
  order: 40,
  isCore: true,
  description: "Directory of suppliers and contact info",
};
