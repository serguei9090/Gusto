import { Calculator } from "lucide-react";
import { CalculatorsPage } from "@/components/pages/CalculatorsPage/CalculatorsPage";
import type { ModuleDefinition } from "@/types/module";

export * from "@/components/pages/CalculatorsPage/CalculatorsPage";

export const calculatorsModule: ModuleDefinition = {
  id: "calculators",
  title: "Calculators",
  icon: Calculator,
  component: CalculatorsPage,
  order: 60,
  isCore: true,
  description: "Math helpers for kitchen operations",
};
