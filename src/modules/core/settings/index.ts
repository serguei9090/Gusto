import { Settings } from "lucide-react";
import React from "react";
import type { ModuleDefinition } from "@/types/module";
import { useConfigStore } from "./store/config.store";
import { useCurrencyStore } from "./store/currency.store";

const SettingsPage = React.lazy(() =>
  import("./SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

export type { SettingsSection } from "./registry";
export { settingsRegistry } from "./registry";
export * from "./SettingsPage";

export const settingsModule: ModuleDefinition = {
  id: "settings",
  title: "Settings",
  icon: Settings,
  component: SettingsPage,
  order: 100,
  isCore: true,
  description: "Configure application settings and preferences",
  init: async () => {
    await useCurrencyStore.getState().initialize();
    await useConfigStore.getState().loadConfig();
  },
};
