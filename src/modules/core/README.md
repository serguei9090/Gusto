# Gusto Core Modules

This directory contains the **"Open Core"** features of the Gusto Restaurant Manager. These modules are the essential, free features that are always included and registered in the application.

## 📁 Structure
Each module follows a standardized structure to maintain consistency:

- **`index.ts`**: Module definition and registry integration.
- **`View.tsx`** or **`pages/`**: Main UI entry points.
- **`components/`**: UI components specific to this module (following Atomic Design).
- **`store/`**: Module-specific Zustand stores (using `createModuleStore`).
- **`services/`**: Repositories and business logic.
- **`registry.ts`**: (Optional) Defines slots for other modules to plug into.

## 🚀 Available Modules
1. **Dashboard**: Centralized hub for real-time stats and reorder alerts.
2. **Ingredients**: Management of raw products, unit conversions, and price history.
3. **Recipes**: Sub-recipe nesting, batch yield costing, and versioning.
4. **Inventory**: Transactional stock tracking (Purchase, Usage, Waste).
5. **Suppliers**: Vendor contact management and performance tracking.
6. **Prep Sheets**: Production planning and ingredient requirements.
7. **Calculators**: Specialized tools for kitchen yield and food cost math.
8. **Settings**: Global configuration and module-level settings slots.

## 🔌 Extension Points (Slots)
Core modules provide registries that allow **Pro Extensions** to inject functionality without modifying core files:

- **`dashboardRegistry`**: Add custom widgets to the dashboard.
- **`settingsRegistry`**: Plug new configuration sections into the Settings page.
- **`ModuleRegistry`**: Register new modules into the sidebar navigation.
