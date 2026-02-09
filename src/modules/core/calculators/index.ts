import { Calculator } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { CalculatorsPage } from "./CalculatorsPage";

export * from "./CalculatorsPage";

export const calculatorsModule: ModuleDefinition = {
  id: "calculators",
  title: "Calculators",
  icon: Calculator,
  component: CalculatorsPage,
  order: 60,
  isCore: true,
  description: "Math helpers for kitchen operations",
};
