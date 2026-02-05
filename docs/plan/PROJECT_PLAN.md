# Restaurant Recipe Costing & Inventory Management - Project Plan

## 📋 Project Overview

**Name:** RestaurantManage - Recipe Costing & Inventory Module  
**Type:** Standalone Windows Desktop Application  
**Version:** 0.0.1 (MVP Complete)  
**Status:** Phase 2 (Verified)  

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
│   │   ├── organisms/                # DONE: IngredientForm, IngredientTable, Sidebar
│   │   ├── templates/                # DONE: MainLayout
│   │   └── pages/                    # DONE: IngredientsPage
│   ├── services/
│   │   ├── database/
│   │   │   └── client.ts             # DONE: Schema & Connection
│   │   ├── ingredients.service.ts    # DONE: CRUD Logical Layer
│   │   └── recipes.service.ts        # TODO: Phase 2
│   ├── store/
│   │   └── ingredientStore.ts        # DONE: Zustand State
│   └── styles/                       # DONE: Design Tokens
└── src-tauri/                        # DONE: Core Config
```

---

## 🛣️ Roadmap

### ✅ Completed (Phase 0 & 1: Foundation & Ingredient MVP)
- [x] **Project Init:** Tauri v2, React 19, Bun, Lefthook, Biome.
- [x] **Database:** Migrated to Tauri SQL Plugin.
- [x] **UI Framework:** Atomic Design system established.
- [x] **Ingredient Module:** Full Create/Read/Update/Delete (CRUD).
- [x] **Documentation:** Updated README and architecture docs.

---

### 🚀 Next: Phase 2 (Recipe Management v0.0.2)

**Goal:** Enable chefs to create recipes and automatically calculate costs and margins.

#### Step 1: Recipe Data & Service
- [ ] **Recipe Service:** CRUD for Recipes + RecipeIngredients integration.
- [ ] **Unit Conversion Engine:** Handle KG -> Grams, Liters -> ML logic.
- [ ] **Cost Engine:**
    - Calculate **Food Cost** (Sum of ingredients).
    - Calculate **Profit Margin** % (`(Selling - Cost) / Selling`).
    - Calculate **Target Cost** (Suggest Price based on Margin).

#### Step 2: Recipe UI (Organisms)
- [ ] **Recipe Builder:** Advanced form with dynamic ingredient list rows.
- [ ] **Cost Card:** Real-time display of Cost/Price/Margin as you edit.
- [ ] **Recipe Table:** List view with "Star/Dog" profitability indicators.

#### Step 3: Menu Engineering
- [ ] **Menu Analysis:** Visual breakdown of profitable vs popular items.

---

### Phase 3: Inventory & Suppliers (v0.0.3)
- [ ] Supplier Management.
- [ ] Inventory Transaction Logging (Stock In/Out).
- [ ] Low Stock Alerts & Reorder Reports.

### Phase 4: Reporting & Release (v1.0.0)
- [ ] Cost History Charts.
- [ ] PDF Export/Printing for Kitchen (Prep Sheets).
- [ ] User Acceptance Testing.

---

## 🏗️ Development Standards (Atomic Design)

1.  **Atoms:** Single responsibility, pure UI.
2.  **Molecules:** Simple combinations (Form fields, Cards).
3.  **Organisms:** Complex business sections (Forms, Tables).
4.  **Templates:** Layout structures.
5.  **Pages:** Connected views (Store/Service integration).

---

**Last Updated:** 2026-02-04
