import { settingsRegistry } from "./registry";
import {
  AboutSection,
  ConfigSection,
  CurrencySection,
  DataManagementSection,
  GeneralSection,
  ModulesSection,
} from "./sections";

/**
 * Register the core settings sections into the settings registry.
 * This should be called once during app initialization.
 *
 * External modules can register their own sections by calling
 * `settingsRegistry.register(...)` from their `init()` function.
 *
 * Core sections use order 10–50. Module sections should use 100+.
 */
export function registerCoreSettings(): void {
  settingsRegistry.register({
    id: "general",
    title: "General",
    description: "Language and display preferences",
    component: GeneralSection,
    order: 10,
    isCore: true,
  });

  settingsRegistry.register({
    id: "currency",
    title: "Currency",
    description: "Base currency and exchange rates",
    component: CurrencySection,
    order: 20,
    isCore: true,
  });

  settingsRegistry.register({
    id: "modules",
    title: "Modules",
    description: "Enable, disable, and reorder modules",
    component: ModulesSection,
    order: 30,
    isCore: true,
  });

  settingsRegistry.register({
    id: "config",
    title: "Configuration",
    description: "Units, categories, and measurement systems",
    component: ConfigSection,
    order: 40,
    isCore: true,
  });

  settingsRegistry.register({
    id: "about",
    title: "About",
    description: "Application info and support",
    component: AboutSection,
    order: 50,
    isCore: true,
  });

  settingsRegistry.register({
    id: "data",
    title: "Data Management",
    description: "Backup and restore",
    component: DataManagementSection,
    order: 60,
    isCore: true,
  });
}
