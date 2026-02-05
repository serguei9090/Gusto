# Restaurant Recipe Costing & Inventory Management - Project Plan

## 📋 Project Overview

**Name:** RestaurantManage - Recipe Costing & Inventory Module  
**Type:** Standalone Windows Desktop Application  
**Version:** 0.0.2 (Recipes Complete)  
**Status:** Phase 3 (Planning)  

### Purpose
A modern, intuitive desktop application for restaurant managers to:
- Calculate recipe costs with precision
- Manage ingredient inventory in real-time
- Track ingredient prices and supplier information
- Generate cost reports and profitability analysis

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19+ with TypeScript
- **Build Tool:** Vite
- **Package Manager:** Bun
- **Desktop Framework:** Tauri 2.x (Rust-based)
- **Styling:** CSS Modules + CSS Variables
- **UI Architecture:** Atomic Design Pattern

### Backend/Storage
- **Database:** SQLite (Local file: `restaurant.db`)
- **Access Layer:** Tauri SQL Plugin (`@tauri-apps/plugin-sql`)
- **Data Validation:** Zod
- **Type Safety:** Shared TypeScript Interfaces

### Development & Quality
- **Linting/Formatting:** Biome
- **Git Hooks:** Lefthook
- **Testing:** Vitest (unit) + Playwright (E2E)
- **State Management:** Zustand
- **Documentation:** `sync-docs` skill used for continuous alignment

---

## 📂 Project Structure (Atomic Design)

```
RestaurantManage/
├── src/
│   ├── components/
│   │   ├── atoms/                    # DONE: Button, Input, Label, Icon
│   │   ├── molecules/                # DONE: FormField, SearchBar, StatCard
│   │   ├── organisms/                # DONE: IngredientForm/Table, RecipeForm/Table
│   │   ├── templates/                # DONE: MainLayout
│   │   └── pages/                    # DONE: IngredientsPage, RecipesPage
│   ├── services/
│   │   ├── database/
│   │   │   └── client.ts             # DONE: Schema & Connection
│   │   ├── ingredients.service.ts    # DONE: CRUD
│   │   └── recipes.service.ts        # DONE: CRUD + Costing
│   ├── store/
│   │   ├── ingredientStore.ts        # DONE: State
│   │   └── recipeStore.ts            # DONE: State
│   └── styles/                       # DONE: Design Tokens
└── src-tauri/                        # DONE: Core Config
```

---

## 🛣️ Roadmap

### ✅ Completed (Phase 0, 1, 2)
- [x] **Foundation:** Tauri v2, React 19, Atomic Design.
- [x] **Ingredient Module:** Full CRUD.
- [x] **Recipe Logic:** Cost Engine (Margins, Unit Conversions).
- [x] **Recipe UI:** Builder Form with real-time calculations.

---

### 🚀 Next: Phase 3 (Inventory & Suppliers v0.0.3)

**Goal:** Track stock levels, manage suppliers, and handle inventory movements.

#### Step 1: Inventory Core (Transactions)
- [ ] **Transaction Logic:** `logTransaction` (Purchase/Usage/Waste) updating `current_stock`.
- [ ] **Inventory Store:** State for Transactions & Stock History.
- [ ] **Stock UI:**
    - `InventoryPage`: Dashboard.
    - `TransactionForm`: Modal to "Add Stock" or "Record Waste".

#### Step 2: Supplier Management
- [ ] **Supplier Service:** CRUD (Create/Edit Suppliers).
- [ ] **Supplier UI:** Manage Suppliers.
- [ ] **Linking:** Assign default supplier to ingredients.

#### Step 3: Low Stock Alerts
- [ ] **Alert Logic:** Check `current_stock` < `min_stock`.
- [ ] **Dashboard Widget:** "Items to Order".

---

### Phase 4: Reporting & Release (v1.0.0)
- [ ] Cost History Charts.
- [ ] PDF Export/Printing for Kitchen (Prep Sheets).
- [ ] User Acceptance Testing.

---

**Last Updated:** 2026-02-04
