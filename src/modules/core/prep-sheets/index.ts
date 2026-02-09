import { ClipboardList } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { PrepSheetsPage } from "./components/PrepSheetsPage";

export * from "./components/PrepSheetsPage";

export const prepSheetsModule: ModuleDefinition = {
  id: "prepsheets",
  title: "Prep Sheets",
  icon: ClipboardList,
  component: PrepSheetsPage,
  order: 50,
  isCore: true,
  description: "Create and manage kitchen prep sheets",
};
