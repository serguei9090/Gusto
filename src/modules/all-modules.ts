import { registry } from "@/lib/modules/registry";
import type { ModuleDefinition } from "@/types/module";
import { registerCoreMigrations } from "@/services/database/registerCoreMigrations";
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
 * Register all available modules.
 * Core modules are registered immediately.
 * Pro modules are registered only if VITE_APP_MODE is 'pro'.
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

  // Register Pro Modules (Conditional)
  // We use import.meta.glob to safely check for the pro folder without crashing the build if it's missing (CI/CD)
  const proImports = import.meta.glob("./pro/index.ts") as Record<string, () => Promise<{ proModules: ModuleDefinition[] }>>;
  const proEntryPath = "./pro/index.ts";

  if (import.meta.env.VITE_APP_MODE === "pro") {
    const importFn = proImports[proEntryPath];

    if (importFn) {
      logger.info("Registering Pro modules...");
      importFn()
        .then((mod) => {
          const { proModules } = mod;
          logger.debug(
            "Found Pro modules:",
            proModules.map((m: ModuleDefinition) => m.id),
          );
          for (const module of proModules) {
            registry.register(module);
          }
          logger.info("Pro modules registered successfully");
        })
        .catch((error) => {
          logger.warn("Pro modules could not be loaded from entry:", error);
        });
    } else {
      logger.warn("Pro directory not found, skipping Pro registration.");
    }
  }
}
