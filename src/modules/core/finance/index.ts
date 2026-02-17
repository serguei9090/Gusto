import { BadgeDollarSign } from "lucide-react";
import React from "react";
import type { ModuleDefinition } from "@/types/module";

// Lazy load the main page
const FinanceDashboard = React.lazy(() =>
  import("./components/pages/FinanceDashboard").then((m) => ({
    default: m.FinanceDashboard,
  })),
);

export const financeModule: ModuleDefinition = {
  id: "finance",
  title: "Finance",
  icon: BadgeDollarSign,
  component: FinanceDashboard,
  order: 40,
  isCore: true,
  description: "Costing, Margins, and P&L",
};
