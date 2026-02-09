import { registry } from "@/lib/modules/registry";
import { calculatorsModule } from "./core/calculators";
import { dashboardModule } from "./core/dashboard";
import { ingredientsModule } from "./core/ingredients";
import { inventoryModule } from "./core/inventory";
import { prepSheetsModule } from "./core/prep-sheets";
import { recipesModule } from "./core/recipes";
import { settingsModule } from "./core/settings";
import { suppliersModule } from "./core/suppliers";

/**
 * Register all available modules.
 * Core modules are registered immediately.
 * Pro modules are registered only if VITE_APP_MODE is 'pro'.
 */
export function registerModules() {
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
  console.log("DEBUG: VITE_APP_MODE =", import.meta.env.VITE_APP_MODE);
  if (import.meta.env.VITE_APP_MODE === "pro") {
    console.log("DEBUG: Registering Pro modules...");
    import("./pro")
      .then(({ proModules }) => {
        console.log(
          "DEBUG: Found Pro modules:",
          proModules.map((m) => m.id),
        );
        for (const module of proModules) {
          registry.register(module);
        }
        console.log("Pro modules registered successfully");
      })
      .catch((error) => {
        console.warn("Pro modules could not be loaded:", error);
      });
  }
}

// Auto-register on import?
// Or call this in main.tsx. Calling in main.tsx is cleaner.
