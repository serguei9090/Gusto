import { registry } from "@/lib/modules/registry";
import { registerCoreMigrations } from "@/services/database/registerCoreMigrations";
import type { ModuleDefinition } from "@/types/module";
import { logger } from "@/utils/logger";
import { calculatorsModule } from "./core/calculators";
import { dashboardModule } from "./core/dashboard";
import { ingredientsModule } from "./core/ingredients";
import { inventoryModule } from "./core/inventory";
import { prepSheetsModule } from "./core/prep-sheets";
import { recipesModule } from "./core/recipes";
import { settingsModule } from "./core/settings";
import { registerCoreSettings } from "./core/settings/registerCoreSettings";
import { suppliersModule } from "./core/suppliers";

/**
 * Register all available modules and UI components.
 * Core modules are registered immediately.
 * Mobile UI from Pro folder is registered if available.
 * Pro feature modules are registered only if VITE_APP_MODE is 'pro'.
 */
export function registerModules() {
  // Register Core Settings Slots and Migrations (before modules)
  registerCoreSettings();
  registerCoreMigrations();

  // Register Core Modules (Always)

  registry.register(dashboardModule);
  registry.register(ingredientsModule);
  registry.register(recipesModule);
  registry.register(inventoryModule);
  registry.register(suppliersModule);
  registry.register(prepSheetsModule);
  registry.register(calculatorsModule);
  registry.register(settingsModule);

  // Load Pro Folder Extensions
  const proExtensions = import.meta.glob("./pro/index.ts") as Record<
    string,
    () => Promise<{
      getProModules: () => ModuleDefinition[];
    }>
  >;
  const proEntryPath = "./pro/index.ts";
  const importFn = proExtensions[proEntryPath];

  if (importFn) {
    importFn()
      .then((mod) => {
        const { getProModules } = mod;
        const mode = import.meta.env.VITE_APP_MODE;

        // Register Pro Feature Modules only for 'pro' or 'mobile-pro' modes
        if (mode === "pro" || mode === "mobile-pro") {
          const proModules = getProModules?.() || [];
          logger.info(
            `Registering ${proModules.length} Pro feature modules...`,
          );
          for (const module of proModules) {
            registry.register(module);
          }
          logger.info("Pro modules registered successfully");
        } else {
          logger.info(`Running in ${mode} mode. Pro feature modules skipped.`);
        }
      })
      .catch((error) => {
        logger.warn("Pro extensions could not be loaded:", error);
      });
  } else {
    logger.debug("Pro folder not detected. Running standard Core build.");
  }
}
