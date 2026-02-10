import { registry } from "@/lib/modules/registry";
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
  // Register Core Settings Slots (before modules, so init() can add to them)
  registerCoreSettings();

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
  logger.debug("VITE_APP_MODE =", import.meta.env.VITE_APP_MODE);
  if (import.meta.env.VITE_APP_MODE === "pro") {
    logger.info("Registering Pro modules...");
    import("./pro")
      .then(({ proModules }) => {
        logger.debug(
          "Found Pro modules:",
          proModules.map((m) => m.id),
        );
        for (const module of proModules) {
          registry.register(module);
        }
        logger.info("Pro modules registered successfully");
      })
      .catch((error) => {
        logger.warn("Pro modules could not be loaded:", error);
      });
  }
}
