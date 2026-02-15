# Gusto - Project Wiki

**Version:** 1.0.5  
**Tech Stack:** Tauri v2 + React 19 + TypeScript + Kysely + SQLite  
**Last Updated:** 2026-02-15

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Desktop Runtime** | Tauri v2 | Native desktop app with web frontend |
| **Frontend** | React 19 + TypeScript | UI components and state management |
| **Styling** | Tailwind CSS v4 + Shadcn/UI | Utility-first CSS + Modern component primitives |
| **Database** | SQLite via Tauri SQL Plugin | Local data persistence |
| **Query Builder** | Kysely | Type-safe SQL query construction |  
| **State Management** | Zustand | Lightweight global state |
| **Animations** | Framer Motion | Fluid UI transitions |
| **Testing** | Playwright + Vitest | E2E and unit testing |

### Project Structure (Atomic Design + Modules)

```
Gusto/
├── src/
│   ├── components/          # Shared Global UI components (Atomic Design)
│   │   ├── ui/             # Shadcn primitives (Base Layer)
│   │   ├── atoms/          # Domain-specific smallest units (Inputs, Badges)
│   │   ├── molecules/      # Composed units (Selectors, Cards)
│   │   ├── organisms/      # Complex data-aware sections (Forms, Tables)
│   │   ├── templates/      # Main page layout structures
│   │   └── pages/          # Full page compositions (DashboardPage, etc)
│   ├── modules/            # Feature-level business logic
│   │   ├── core/           # Open-source feature logic (States, Services)
│   │   └── pro/            # Private extension modules
│   ├── lib/                # Framework configurations & DB setup
│   ├── services/           # Global business logic services
│   ├── hooks/              # Global React hooks
│   ├── types/              # Domain-wide TypeScript definitions
│   └── utils/              # Pure utility functions and validators
├── e2e/                    # End-to-end tests
├── src-tauri/              # Tauri native layer
└── docs/                   # Project documentation
```

### Modular "Open Core" Architecture

The project uses a modular design to separate base functionality from professional extensions:

1. **Module Registry**: All modules must register their routes, icons, and metadata in `src/modules/all-modules.ts`.
2. **Standard Interface**:
   ```typescript
   export interface Module {
     id: string;
     title: string;
     icon: string;
     component: React.ComponentType;
     order: number;
   }
   ```
3. **Core vs Pro**: 
   - `core/`: Standard features (Dashboard, Ingredients, Recipes, Suppliers).
   - `pro/`: **Closed-source** premium extensions (Managed privately). These are currently **Under Construction** and allow for custom bespoke development.

---

## Features

### 1. Ingredient Management
**Location:** `src/modules/core/ingredients`

- CRUD operations for kitchen ingredients.
- Real-time stock alerts and minimum threshold tracking.
- Automated unit conversion engine.

### 2. Recipe Costing
**Location:** `src/modules/core/recipes`

- Dynamic cost calculation based on ingredient price changes.
- Version history tracking and rollback.
- Batch pricing and profit margin optimization.

### 3. Inventory Control
**Location:** `src/modules/core/inventory`

- Transactional logging (Purchase, Usage, Waste).
- Automated stock adjustments linked to recipe production.

### 4. Dashboard Analytics
**Location:** `src/modules/core/dashboard`

- Financial health overview.
- Urgent reorder alerts.
- Top performing recipes by margin.

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

1. **Define domain model:** Add to `src/types/`
2. **Setup state:** `src/modules/core/[feature]/store/[feature].store.ts`
3. **Create repository:** `src/modules/core/[feature]/services/[feature].repository.ts`
4. **Build UI elements:**
   - Primitives: `src/components/ui/`
   - Unit elements: `src/components/atoms/`
   - Composed UI: `src/components/molecules/`
   - Data-aware UI: `src/components/organisms/`
5. **Assemble full page:** `src/components/pages/[FeaturePage]/[FeaturePage].tsx`
6. **Register Module:** Update `src/modules/core/[feature]/index.ts` and `src/modules/all-modules.ts`
7. **Write tests:** Unit tests in `src/modules/core/[feature]/__tests__/`, E2E in `e2e/`

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
