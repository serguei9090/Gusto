import { ClipboardList } from "lucide-react";
import { PrepSheetsPage } from "@/components/pages/PrepSheetsPage/PrepSheetsPage";
import type { ModuleDefinition } from "@/types/module";

export * from "@/components/pages/PrepSheetsPage/PrepSheetsPage";

export const prepSheetsModule: ModuleDefinition = {
  id: "prepsheets",
  title: "Prep Sheets",
  icon: ClipboardList,
  component: PrepSheetsPage,
  order: 50,
  isCore: true,
  description: "Create and manage kitchen prep sheets",
};
