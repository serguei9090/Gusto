import { Settings } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { SettingsPage } from "./SettingsPage";

export * from "./SettingsPage";

export const settingsModule: ModuleDefinition = {
  id: "settings",
  title: "Settings",
  icon: Settings,
  component: SettingsPage,
  order: 100,
  isCore: true,
  description: "Configure application settings and preferences",
};
