# Restaurant Recipe Costing & Inventory Management - Project Plan

## 📋 Project Overview

**Name:** RestaurantManage - Recipe Costing & Inventory Module  
**Type:** Standalone Windows Desktop Application  
**Version:** 1.0.0  
**Status:** Planning Phase

### Purpose
A modern, intuitive desktop application for restaurant managers to:
- Calculate recipe costs with precision
- Manage ingredient inventory in real-time
- Track ingredient prices and supplier information
- Generate cost reports and profitability analysis

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Package Manager:** Bun
- **Desktop Framework:** Tauri 2.x (Rust-based, lightweight alternative to Electron)
- **Styling:** CSS Modules + CSS Variables
- **UI Architecture:** Atomic Design Pattern

### Backend/Storage
- **Database:** SQLite (Local file)
- **Access Layer:** Tauri SQL Plugin (Direct SQL execution)
- **Data Validation:** Zod

### Development & Quality
- **Linting/Formatting:** Biome
- **Git Hooks:** Lefthook
- **Testing:** Vitest (unit) + Playwright (E2E)
- **State Management:** Zustand (lightweight, simple)
- **Type Safety:** TypeScript 5.x (strict mode)

### Why This Stack?
1. **Tauri:** 10x smaller than Electron, better security, native performance
2. **SQLite:** Perfect for local-first desktop apps, ACID compliant, zero configuration
3. **Bun:** Fast package management, aligns with user standards
4. **Drizzle ORM:** Type-safe queries, migration support, lightweight
5. **Atomic Design:** Scalable, maintainable component architecture

---

## 📁 Project Structure

```
RestaurantManage/
│
├── .github/                          # GitHub workflows (optional)
│   └── workflows/
│       └── ci.yml                    # CI/CD automation
│
├── docs/                             # Documentation
│   ├── plan/
│   │   ├── PROJECT_PLAN.md           # This file
│   │   ├── DATABASE_SCHEMA.md        # Database design
│   │   ├── FEATURES.md               # Feature specifications
│   │   └── UI_MOCKUPS.md             # UI design references
│   └── guides/
│       ├── SETUP.md                  # Development setup guide
│       └── ARCHITECTURE.md           # Technical architecture
│
├── src/                              # Frontend source code
│   ├── main.tsx                      # Application entry point
│   ├── App.tsx                       # Root component
│   │
│   ├── components/                   # Atomic Design Structure
│   │   ├── atoms/                    # Basic building blocks
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Label/
│   │   │   ├── Icon/
│   │   │   └── Badge/
│   │   │
│   │   ├── molecules/                # Simple component combinations
│   │   │   ├── FormField/
│   │   │   ├── SearchBar/
│   │   │   ├── IngredientCard/
│   │   │   ├── PriceDisplay/
│   │   │   └── AlertDialog/
│   │   │
│   │   ├── organisms/                # Complex UI sections
│   │   │   ├── RecipeForm/
│   │   │   ├── InventoryTable/
│   │   │   ├── CostBreakdown/
│   │   │   ├── SupplierManager/
│   │   │   └── Sidebar/
│   │   │
│   │   ├── templates/                # Page layouts
│   │   │   ├── MainLayout/
│   │   │   ├── DashboardLayout/
│   │   │   └── ReportLayout/
│   │   │
│   │   └── pages/                    # Complete pages
│   │       ├── Dashboard/
│   │       ├── Recipes/
│   │       ├── Inventory/
│   │       ├── Suppliers/
│   │       └── Reports/
│   │
│   ├── store/                        # State management (Zustand)
│   │   ├── recipeStore.ts
│   │   ├── inventoryStore.ts
│   │   ├── supplierStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useRecipes.ts
│   │   ├── useInventory.ts
│   │   ├── useDatabase.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/                     # Business logic & API
│   │   ├── database/
│   │   │   ├── schema.ts             # Drizzle schema definitions
│   │   │   ├── migrations/
│   │   │   └── client.ts
│   │   ├── recipes.service.ts
│   │   ├── inventory.service.ts
│   │   └── suppliers.service.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts             # Currency, date formatters
│   │   ├── validators.ts             # Zod validation schemas
│   │   ├── calculations.ts           # Recipe costing logic
│   │   └── constants.ts
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── recipe.types.ts
│   │   ├── inventory.types.ts
│   │   └── supplier.types.ts
│   │
│   ├── assets/                       # Static assets
│   │   ├── icons/
│   │   ├── images/
│   │   └── fonts/
│   │
│   └── styles/                       # Global styles
│       ├── index.css                 # Design system, CSS variables
│       ├── reset.css
│       └── utilities.css
│
├── src-tauri/                        # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs                   # Tauri app entry
│   │   └── commands.rs               # Custom Tauri commands
│   ├── Cargo.toml                    # Rust dependencies
│   ├── tauri.conf.json               # Tauri configuration
│   └── icons/                        # App icons
│
├── tests/                            # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                          # Build & utility scripts
│   ├── setup-db.ts                   # Database initialization
│   └── seed-data.ts                  # Sample data seeding
│
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── lefthook.yml                      # Git hooks configuration
├── biome.json                        # Biome configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
├── package.json                      # NPM dependencies
├── bun.lockb                         # Bun lock file
└── README.md                         # Project overview

```

---

## 🗄️ Database Schema Design

### Core Tables

#### 1. **ingredients**
```sql
CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,          -- 'protein', 'vegetable', 'dairy', 'spice', etc.
  unit_of_measure TEXT NOT NULL,   -- 'kg', 'liter', 'piece', 'gram', etc.
  current_price REAL NOT NULL,
  price_per_unit REAL NOT NULL,    -- Normalized price
  supplier_id INTEGER,
  min_stock_level REAL,            -- For inventory alerts
  current_stock REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

#### 2. **suppliers**
```sql
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **recipes**
```sql
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,                    -- 'appetizer', 'main', 'dessert', 'beverage'
  servings INTEGER NOT NULL,        -- Number of portions
  prep_time_minutes INTEGER,
  cooking_instructions TEXT,
  selling_price REAL,               -- Menu price
  target_cost_percentage REAL,      -- Target food cost %
  total_cost REAL,                  -- Calculated from ingredients
  profit_margin REAL,               -- Calculated
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. **recipe_ingredients**
```sql
CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  ingredient_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,               -- Must match ingredient UOM or be convertible
  cost REAL,                        -- Calculated cost for this quantity
  notes TEXT,                       -- e.g., "finely chopped"
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
```

#### 5. **inventory_transactions**
```sql
CREATE TABLE inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,   -- 'purchase', 'usage', 'adjustment', 'waste'
  quantity REAL NOT NULL,           -- Positive for additions, negative for usage
  cost_per_unit REAL,
  total_cost REAL,
  reference TEXT,                   -- Invoice number, recipe name, etc.
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);
```

#### 6. **price_history**
```sql
CREATE TABLE price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  price REAL NOT NULL,
  supplier_id INTEGER,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_inventory_transactions_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX idx_price_history_ingredient ON price_history(ingredient_id);
```

---

## 🎯 Core Features & User Stories

### Phase 1: MVP Features (Current Scope)

#### Feature 1: Ingredient Management
**User Stories:**
- ✅ As a manager, I can add new ingredients with name, category, unit, and price
- ✅ As a manager, I can edit ingredient details
- ✅ As a manager, I can delete ingredients (with confirmation)
- ✅ As a manager, I can view all ingredients in a searchable table
- ✅ As a manager, I can filter ingredients by category
- ✅ As a manager, I can track price changes over time

**UI Components:**
- Ingredient list table (organism)
- Add/Edit ingredient form (organism)
- Search and filter bar (molecule)
- Price history chart (organism)

#### Feature 2: Recipe Management
**User Stories:**
- ✅ As a chef, I can create new recipes with name, description, and servings
- ✅ As a chef, I can add multiple ingredients to a recipe with quantities
- ✅ As a chef, I can see the calculated total cost of a recipe
- ✅ As a chef, I can set a selling price and see profit margins
- ✅ As a chef, I can duplicate recipes for variations
- ✅ As a chef, I can archive/delete recipes

**UI Components:**
- Recipe list/cards (organism)
- Recipe builder form (organism)
- Ingredient selector (molecule)
- Cost breakdown panel (organism)

#### Feature 3: Inventory Tracking
**User Stories:**
- ✅ As a manager, I can record ingredient purchases
- ✅ As a manager, I can track current stock levels
- ✅ As a manager, I can receive low-stock alerts
- ✅ As a manager, I can record ingredient usage (manual or recipe-based)
- ✅ As a manager, I can record waste/adjustments
- ✅ As a manager, I can view inventory transaction history

**UI Components:**
- Inventory dashboard (page)
- Transaction form (organism)
- Stock level indicators (molecules)
- Alert notifications (atoms)

#### Feature 4: Cost Reports
**User Stories:**
- ✅ As a manager, I can view cost analysis for each recipe
- ✅ As a manager, I can see food cost percentage reports
- ✅ As a manager, I can compare recipe profitability
- ✅ As a manager, I can export reports as PDF/CSV
- ✅ As a manager, I can view inventory value

**UI Components:**
- Report dashboard (page)
- Cost charts (organisms)
- Export buttons (atoms)
- Data tables (organisms)

#### Feature 5: Supplier Management
**User Stories:**
- ✅ As a manager, I can add supplier information
- ✅ As a manager, I can link ingredients to suppliers
- ✅ As a manager, I can view supplier contact details
- ✅ As a manager, I can track which supplier provides best prices

**UI Components:**
- Supplier list (organism)
- Supplier form (organism)
- Price comparison view (organism)

---

## 🎨 Design System

### Color Palette (Modern Restaurant Theme)
```css
:root {
  /* Primary - Professional Green */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;
  --color-primary-700: #15803d;

  /* Neutral - Clean Grays */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-500: #737373;
  --color-neutral-700: #404040;
  --color-neutral-900: #171717;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Surface */
  --surface-base: #ffffff;
  --surface-elevated: #fafafa;
  --surface-overlay: rgba(0, 0, 0, 0.05);

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing Scale */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Typography Scale
```css
/* Headings */
.heading-xl { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }
.heading-lg { font-size: 2rem; font-weight: 700; line-height: 1.3; }
.heading-md { font-size: 1.5rem; font-weight: 600; line-height: 1.4; }
.heading-sm { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }

/* Body */
.body-lg { font-size: 1.125rem; line-height: 1.6; }
.body-md { font-size: 1rem; line-height: 1.5; }
.body-sm { font-size: 0.875rem; line-height: 1.5; }

/* Labels */
.label { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
```

---

## 🔧 Development Workflow

### 1. Initial Setup
```bash
# Create project directory
cd i:\01-Master_Code\Apps\RestaurantManage

# Initialize Git
git init
git branch -M main

# Create .gitignore (Node/Bun, Tauri, SQLite patterns)
# Create .env.example

# Initialize Tauri + Vite + React + TypeScript
bun create tauri-app

# Install dependencies
bun install

# Install development tools
bun add -d @biomejs/biome vitest @vitest/ui playwright
bun add -d drizzle-orm drizzle-kit
bun add zustand zod date-fns

# Initialize Lefthook
bunx lefthook install
```

### 2. Lefthook Configuration
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    js-quality:
      glob: "*.{js,ts,jsx,tsx,json}"
      run: bun x @biomejs/biome check --apply {staged_files}
    type-check:
      glob: "*.{ts,tsx}"
      run: bunx tsc --noEmit

pre-push:
  commands:
    tests:
      run: bun test
```

### 3. Development Commands
```json
// package.json scripts
{
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:migrate": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 4. Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/ingredient-management
# ... make changes ...
git add .
git commit -m "feat: add ingredient CRUD operations"
git push origin feature/ingredient-management

# Commit message conventions (Conventional Commits)
# feat: new feature
# fix: bug fix
# docs: documentation changes
# style: formatting, no code change
# refactor: code restructuring
# test: adding tests
# chore: maintenance tasks
```

---

## 📊 Business Logic & Calculations

### Recipe Cost Calculation
```typescript
function calculateRecipeCost(recipeIngredients: RecipeIngredient[]): number {
  return recipeIngredients.reduce((total, item) => {
    const ingredientCost = item.ingredient.pricePerUnit;
    const quantity = convertToBaseUnit(item.quantity, item.unit, item.ingredient.unitOfMeasure);
    return total + (ingredientCost * quantity);
  }, 0);
}
```

### Food Cost Percentage
```typescript
function calculateFoodCostPercentage(totalCost: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return (totalCost / sellingPrice) * 100;
}
```

### Profit Margin
```typescript
function calculateProfitMargin(sellingPrice: number, totalCost: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - totalCost) / sellingPrice) * 100;
}
```

### Unit Conversion System
```typescript
// Support conversions: kg ↔ g, L ↔ mL, etc.
const conversionFactors = {
  'kg-g': 1000,
  'g-kg': 0.001,
  'l-ml': 1000,
  'ml-l': 0.001,
  // ... more conversions
};
```

---

## 🚀 Implementation Roadmap

### Week 1: Project Foundation
- [ ] Initialize Tauri + Vite + React project
- [ ] Set up folder structure (Atomic Design)
- [ ] Configure Biome, Lefthook, TypeScript
- [ ] Define database schema with Drizzle
- [ ] Create design system (CSS variables, utilities)
- [ ] Build core atoms (Button, Input, Label, Icon)

### Week 2: Database & State
- [ ] Implement Drizzle schema and migrations
- [ ] Create database service layer
- [ ] Set up Zustand stores (recipes, inventory, suppliers)
- [ ] Build custom hooks (useRecipes, useInventory, etc.)
- [ ] Add data validation with Zod
- [ ] Write unit tests for business logic

### Week 3: Ingredient & Supplier Features
- [ ] Build ingredient molecules & organisms
- [ ] Implement ingredient CRUD operations
- [ ] Create supplier management UI
- [ ] Add price history tracking
- [ ] Implement search and filtering
- [ ] Add confirmation dialogs for deletions

### Week 4: Recipe Management
- [ ] Build recipe builder UI
- [ ] Implement drag-and-drop ingredient selection
- [ ] Add recipe cost calculation
- [ ] Create cost breakdown visualization
- [ ] Implement recipe duplication
- [ ] Add recipe categories and filtering

### Week 5: Inventory & Reports
- [ ] Build inventory dashboard
- [ ] Implement transaction recording
- [ ] Add stock level alerts
- [ ] Create inventory reports
- [ ] Build cost analysis charts
- [ ] Add PDF/CSV export functionality

### Week 6: Polish & Testing
- [ ] E2E testing with Playwright
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG compliance)
- [ ] User acceptance testing
- [ ] Bug fixes and refinements
- [ ] Documentation completion

---

## ✅ Quality Checklist

### Code Quality
- [ ] All components follow Atomic Design
- [ ] TypeScript strict mode enabled, zero `any` types
- [ ] All functions have proper type annotations
- [ ] Biome linting passes with zero errors
- [ ] Code coverage > 80% for business logic

### UI/UX Quality
- [ ] Responsive design (supports 1280x720 minimum)
- [ ] Consistent spacing using design tokens
- [ ] All interactive elements have hover/focus states
- [ ] Loading states for async operations
- [ ] Error states with helpful messages
- [ ] Keyboard navigation support
- [ ] ARIA labels for screen readers

### Performance
- [ ] Initial load < 2 seconds
- [ ] Database queries optimized with indexes
- [ ] Large lists use virtualization
- [ ] Images/assets optimized
- [ ] Bundle size < 10MB

### Security
- [ ] Input validation on all forms
- [ ] SQL injection prevention (use parameterized queries)
- [ ] No sensitive data in logs
- [ ] Secure file permissions for database

---

## 📚 Documentation Requirements

### Developer Documentation
- [ ] README.md with setup instructions
- [ ] ARCHITECTURE.md explaining key design decisions
- [ ] API documentation for services
- [ ] Database schema documentation
- [ ] Component Storybook (optional but recommended)

### User Documentation
- [ ] User guide for each feature
- [ ] Video tutorials for common workflows
- [ ] Troubleshooting guide
- [ ] FAQ section

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 2 Features
- Multi-restaurant support (database per location)
- Menu planning and seasonal recipes
- Vendor order automation
- Barcode scanning for inventory
- Mobile companion app (React Native)
- Cloud sync (optional)
- Recipe versioning and rollback
- Allergen tracking
- Nutritional information calculation
- Integration with POS systems

### Phase 3 Features
- AI-powered recipe suggestions
- Predictive inventory management
- Automated reordering
- Recipe scaling calculator
- Waste tracking analytics
- Supplier performance metrics

---

## 📞 Support & Maintenance

### Version Control Strategy
- `main` branch: production-ready code
- `develop` branch: integration branch
- `feature/*` branches: new features
- `bugfix/*` branches: bug fixes

### Release Cycle
- Major releases (1.x.0): Quarterly
- Minor releases (1.1.x): Monthly
- Patches (1.1.1): As needed

### Backup Strategy
- Database backups: Daily automatic exports
- Backup location: User-defined folder
- Restore functionality in settings

---

## 🎓 Learning Resources

### For New Developers
1. **Tauri Documentation:** https://tauri.app/
2. **Drizzle ORM Guide:** https://orm.drizzle.team/
3. **Atomic Design Methodology:** https://atomicdesign.bradfrost.com/
4. **React TypeScript Cheatsheet:** https://react-typescript-cheatsheet.netlify.app/

### Design References
- Restaurant POS systems (Toast, Square, Lightspeed)
- Inventory apps (MarketMan, BlueCart)
- Modern dashboard designs (Linear, Notion, Raycast)

---

## ✨ Success Criteria

The MVP is considered complete when:
1. ✅ A user can manage 100+ ingredients without performance issues
2. ✅ Recipe costs update automatically when ingredient prices change
3. ✅ Inventory transactions are accurately recorded and displayed
4. ✅ Reports can be generated and exported
5. ✅ The app runs smoothly on Windows 10/11
6. ✅ All core features have >80% test coverage
7. ✅ User can complete common workflows in < 5 clicks
8. ✅ Zero critical bugs, < 5 minor bugs

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-04  
**Next Review:** Weekly during development
