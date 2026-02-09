# RestaurantManage - Project Wiki

**Version:** 1.0.0  
**Tech Stack:** Tauri v2 + React 19 + TypeScript + Kysely + SQLite  
**Last Updated:** 2026-02-05

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Database Schema](#database-schema)
5. [Testing Infrastructure](#testing-infrastructure)
6. [Development Guide](#development-guide)
7. [API Reference](#api-reference)

---

## Overview

RestaurantManage is a desktop application for restaurant cost management, recipe costing, inventory tracking, and prep sheet generation. Built with Tauri for native desktop performance and React for a modern UI.

### Key Capabilities
- **Recipe Costing:** Calculate ingredient costs, profit margins, and suggested pricing
- **Inventory Management:** Track stock levels, log transactions, and detect low stock
- **Supplier Management:** Maintain supplier database with contact information
- **Prep Sheet Generation:** Create production prep lists from recipes
- **Dashboard Analytics:** Real-time insights into inventory value, margins, and reorders

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Desktop Runtime** | Tauri v2 | Native desktop app with web frontend |
| **Frontend** | React 19 + TypeScript | UI components and state management |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first CSS + component library |
| **Database** | SQLite via Tauri SQL Plugin | Local data persistence |
| **Query Builder** | Kysely | Type-safe SQL query construction |  
| **State Management** | Zustand | Lightweight global state |
| **Forms** | React Hook Form + Zod | Form validation and management |
| **Testing** | Playwright + Vitest | E2E and unit testing |

### Project Structure

```
RestaurantManage/
├── src/
│   ├── components/          # UI components (Atomic Design)
│   │   ├── ui/             # Base components (shadcn/ui)
│   │   ├── atoms/          # Smallest units (buttons, inputs)
│   │   ├── molecules/      # Composed units (search bars, cards)
│   │   ├── organisms/      # Complex sections (tables, forms)
│   │   └── pages/          # Full page components
│   ├── features/           # Feature modules
│   │   ├── ingredients/    # Ingredient management
│   │   ├── recipes/        # Recipe management
│   │   ├── inventory/      # Inventory tracking
│   │   ├── suppliers/      # Supplier management
│   │   ├── dashboard/      # Dashboard analytics
│   │   └── prep-sheets/    # Prep sheet generation
│   ├── lib/                # Core utilities
│   │   └── db.ts          # Database client
│   ├── services/           # Business logic layer
│   │   └── database/       # Database service
│   └── utils/              # Helper functions
│       ├── costEngine.ts   # Cost calculations
│       └── conversions.ts  # Unit conversions
├── e2e/                    # End-to-end tests
│   ├── fixtures/           # Test database fixtures
│   └── helpers/            # Test utilities
├── src-tauri/              # Tauri native layer
│   ├── src/                # Rust backend
│   ├── icons/              # App icons
│   └── tauri.conf.json     # Tauri configuration
└── docs/                   # Documentation
```

### Feature-Based Architecture

Each feature module follows a consistent structure:

```
features/[feature-name]/
├── components/         # UI components specific to this feature
├── services/          # Business logic and data access
│   └── [feature].repository.ts
├── store/              # Zustand state management
│   └── [feature].store.ts
└── types.ts           # TypeScript type definitions
```

---

## Features

### 1. Ingredient Management
**File:** [src/features/ingredients](file:///i:/01-Master_Code/Apps/RestaurantManage/src/features/ingredients)

- Create, read, update, delete ingredients
- Link ingredients to suppliers
- Track current stock levels and minimum thresholds
- Price per unit tracking
- Category organization (protein, dairy, vegetable, etc.)
- Unit of measure support (kg, g, L, mL, etc.)

**Key Components:**
- `IngredientForm`: Add/edit ingredient modal
- `IngredientTable`: Searchable ingredient list
- `IngredientsRepository`: Data access layer

### 2. Recipe Management
**File:** [src/features/recipes](file:///i:/01-Master_Code/Apps/RestaurantManage/src/features/recipes)

- Create recipes with multiple ingredients
- Automatic cost calculation based on ingredient quantities
- Profit margin and suggested pricing
- Labor cost and overhead percentage
- PDF export for recipe cost sheets
- Yield and serving size tracking
- **Version Control & History:**
  - Automatically tracks every change (ingredients, instructions, costs)
  - View full details of any past version
  - Rollback to previous versions safely
  - "Estimated Price" calculation for historic versions without fixed pricing

**Key Components:**
- `RecipeForm`: Multi-step recipe creation
- `RecipeTable`: Recipe listing with cost summary
- `RecipeDetailModal`: Detailed view with tabs for Overview and History
- `RecipeHistory`: List and rollback interface for version control
- `RecipesRepository`: Recipe data access and calculations

### 3. Inventory Tracking
**File:** [src/features/inventory](file:///i:/01-Master_Code/Apps/RestaurantManage/src/features/inventory)

- Log inventory transactions (purchase, usage, adjustment, waste)
- Automatic stock level updates
- Low stock detection and alerts
- Transaction history with references
- Cost tracking per transaction

**Transaction Types:**
- **Purchase:** Stock in from suppliers
- **Usage:** Stock out for production
- **Adjustment:** Manual stock corrections
- **Waste:** Spoilage or loss tracking

### 4. Supplier Management
**File:** [src/features/suppliers](file:///i:/01-Master_Code/Apps/RestaurantManage/src/features/suppliers)

- Supplier contact database
- Email, phone, address tracking
- Payment terms and notes
- Link suppliers to ingredients

### 5. Dashboard & Analytics
**File:** [src/features/dashboard](file:///i:/01-Master_Code/Apps/RestaurantManage/src/features/dashboard)

- **Total Inventory Value:** Sum of all ingredient stock × price
- **Low Stock Count:** Ingredients below minimum threshold
- **Average Profit Margin:** Across all recipes
- **Total Recipes:** Recipe count
- **Top Recipes:** Ranked by profit margin
- **Urgent Reorders:** Ingredients needing immediate restocking

### 6. Prep Sheets
**File:** [src/features/prep-sheets](file:///i:/01-Master_Code/Apps/RestaurantManage/src/features/prep-sheets)

- Generate prep lists from multiple recipes
- Aggregate ingredient quantities
- Save and load prep sheets
- Date and shift tracking
- Print-friendly format

---

## Database Schema

### Tables

#### `suppliers`
```sql
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `ingredients`
```sql
CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  current_price REAL NOT NULL,
  price_per_unit REAL NOT NULL,
  supplier_id INTEGER,
  min_stock_level REAL,
  current_stock REAL DEFAULT 0,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

#### `recipes`
```sql
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  yield_quantity REAL NOT NULL,
  yield_unit TEXT NOT NULL,
  serving_size REAL,
  serving_unit TEXT,
  labor_cost REAL DEFAULT 0,
  overhead_percentage REAL DEFAULT 0,
  target_cost_percentage REAL,
  selling_price REAL,
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `recipe_ingredients`
```sql
CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
```

#### `inventory_transactions`
```sql
CREATE TABLE inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('purchase', 'usage', 'adjustment', 'waste')),
  quantity REAL NOT NULL,
  cost_per_unit REAL,
  total_cost REAL,
  reference TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
```

#### `price_history`
```sql
CREATE TABLE price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  price REAL NOT NULL,
  recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
```

#### `prep_sheets`
```sql
CREATE TABLE prep_sheets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  prep_date TEXT NOT NULL,
  recipes TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Infrastructure

### Unit Tests (Vitest)

**Location:** `src/utils/__tests__/`

**Coverage:**
- Cost engine calculations (14 tests)
- Ingredient cost with unit conversion
- Recipe total cost computation
- Profit margin calculations
- Suggested pricing logic

**Run Tests:**
```bash
bun run test:unit        # Run all unit tests
bun run test:unit:ui     # Open Vitest UI
```

### E2E Tests (Playwright)

**Location:** `e2e/`

**Phase-Based Test Suites:**
1. **01-setup.spec.ts** - Database initialization and app launch
2. **02-suppliers.spec.ts** - Supplier CRUD operations
3. **03-ingredients.spec.ts** - Ingredient management + search
4. **04-recipes.spec.ts** - Recipe creation, cost calculations, PDF export
5. **05-inventory.spec.ts** - Inventory transactions and stock updates
6. **06-prep-sheets.spec.ts** - Prep sheet generation and loading
7. **07-dashboard.spec.ts** - Dashboard stats and calculations
8. **critical-flow.spec.ts** - Complete end-to-end workflow

**Database Fixtures:**
- Real SQLite database via `better-sqlite3`
- Automatic schema initialization
- Sample data seeding (3 suppliers, 4 ingredients, 2 recipes)
- Clean state between tests

**Run Tests:**
```bash
bun run test:e2e         # Run E2E tests
bun run test:e2e:ui      # Open Playwright UI
bun run test:all         # Run all tests (unit + E2E)
```

---

## Development Guide

### Prerequisites
- Node.js 20+ (or Bun runtime)
- Rust toolchain (for Tauri)
- Windows, macOS, or Linux

### Setup

```bash
# Clone repository
git clone <repo-url>
cd RestaurantManage

# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Run development server
bun run tauri:dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run tauri:dev` | Start Tauri app in dev mode |
| `bun run build` | Build for production |
| `bun run test:unit` | Run unit tests |
| `bun run test:e2e` | Run E2E tests |
| `bun run type-check` | TypeScript type checking |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code with Biome |

### Code Quality

**Pre-commit Hooks (Lefthook):**
- TypeScript/JavaScript: Biome check and format
- Auto-runs on `git commit`

### Adding New Features

1. **Create feature module:** `src/features/[feature-name]/`
2. **Define types:** `types.ts`
3. **Create repository:** `services/[feature].repository.ts`
4. **Setup state:** `store/[feature].store.ts`
5. **Build components:** `components/`
6. **Add routes:** Update navigation in `App.tsx`
7. **Write tests:** Unit tests in `__tests__/`, E2E in `e2e/`

---

## API Reference

### Cost Engine

**File:** [src/utils/costEngine.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/src/utils/costEngine.ts)

#### `calculateIngredientCost()`
```typescript
function calculateIngredientCost(
  quantity: number,
  usedUnit: string,
  basePrice: number,
  baseUnit: string
): RecipeItemCost
```

Calculates ingredient cost with unit conversion.

**Example:**
```typescript
// 500g of flour at $2/kg
const result = calculateIngredientCost(500, 'g', 2, 'kg');
// result.cost = 1.00
```

#### `calculateRecipeTotal()`
```typescript
function calculateRecipeTotal(items: CostInputItem[]): {
  totalCost: number;
  errors: string[];
}
```

Sums total cost of all recipe ingredients.

#### `calculateProfitMargin()`
```typescript
function calculateProfitMargin(
  cost: number,
  sellingPrice: number
): number
```

Calculates profit margin percentage.

**Formula:** `((sellingPrice - cost) / sellingPrice) * 100`

#### `calculateSuggestedPrice()`
```typescript
function calculateSuggestedPrice(
  cost: number,
  targetMarginPercent: number
): number
```

Calculates suggested selling price based on target margin.

**Formula:** `cost / (1 - marginDecimal)`

### Unit Conversions

**File:** [src/utils/conversions.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/src/utils/conversions.ts)

#### `convertUnit()`
```typescript
function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number
```

Converts between units of measure.

**Supported:**
- Weight: kg ↔ g
- Volume: L ↔ mL
- Same unit (no conversion)

---

## Configuration Files

### `tauri.conf.json`
Tauri app configuration including:
- App metadata (name, version)
- Window configuration
- SQL plugin capabilities
- Build settings

### `vite.config.ts`
Vite bundler configuration:
- Path aliases (`@` → `./src`)
- Plugin configuration

### `vitest.config.ts`
Unit test runner configuration:
- jsdom environment
- Test file patterns
- Exclude E2E tests

### `playwright.config.ts`
E2E test runner configuration:
- Sequential execution (phase-based)
- Screenshot/video capture
- Web server integration

### `biome.json`
Code quality configuration:
- Linting rules
- Formatting preferences

### `lefthook.yml`
Pre-commit hooks:
- Biome check and format on staged files

---

## Troubleshooting

### Database Issues
- **Database locked:** Ensure only one instance of the app is running
- **Schema mismatch:** Delete `restaurant.db` and restart app

### Build Issues
- **Rust errors:** Ensure Rust toolchain is up to date
- **TypeScript errors:** Run `bun run type-check` to identify issues

### Test Issues
- **E2E tests failing:** Ensure Tauri app is running on `localhost:1420`
- **Database fixture errors:** Check `e2e/fixtures/schema.sql` matches production schema

---

## Contributing

1. Create feature branch from `main`
2. Follow existing code structure and naming conventions
3. Write unit tests for business logic
4. Write E2E tests for user flows
5. Ensure all tests pass (`bun run test:all`)
6. Run linter (`bun run lint:fix`)
7. Submit pull request

---

## License

[Add license information]

---

## Support

[Add support/contact information]
