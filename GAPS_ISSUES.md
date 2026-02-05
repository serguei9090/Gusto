# RestaurantManage - Known Gaps & Issues

**Last Updated:** 2026-02-05  
**Status:** Active Development

---

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [Code Quality Issues](#code-quality-issues)
3. [Feature Gaps](#feature-gaps)
4. [Testing Gaps](#testing-gaps)
5. [Performance Concerns](#performance-concerns)
6. [UX Improvements](#ux-improvements)
7. [Documentation Gaps](#documentation-gaps)

---

## Critical Issues

### Database Connection in Browser Mode
**Severity:** ⚠️ **Medium**  
**File:** [src/lib/db.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/src/lib/db.ts)

**Issue:**  
The `db.ts` file contains a mock implementation to bypass Kysely/Tauri/Vite integration issues during development/testing in browser mode.

**Impact:**
- Tests may pass with mock data but fail with real database
- Inconsistency between dev and production behavior

**Recommended Fix:**
- Implement proper environment detection
- Use conditional exports for browser vs. Tauri environments
- Consider using Kysely properly with dialect configuration

```typescript
// Proposed solution
import { Database } from '@tauri-apps/plugin-sql';

export const db = import.meta.env.TAURI
  ? await Database.load('sqlite:restaurant.db')
  : createMockDb(); // For browser testing only
```

---

## Code Quality Issues

### 1. CSS At-Rules Not Recognized by Biome
**Severity:** 🟡 **Low**  
**Files:** [src/index.css](file:///i:/01-Master_Code/Apps/RestaurantManage/src/index.css)

**Linting Errors:**
- `Unknown at rule @theme` (line 3)
- `Unknown at rule @apply` (lines 125, 129)

**Cause:**  
Tailwind CSS v4 uses `@theme` and `@apply` directives that Biome doesn't recognize.

**Recommended Fix:**
- Update Biome configuration to ignore Tailwind-specific at-rules
- Or disable CSS linting for Tailwind files

```json
// biome.json
{
  "linter": {
    "rules": {
      "css": {
        "noUnknownAtRule": "off"
      }
    }
  }
}
```

### 2. RegExp in Playwright Selectors
**Severity:** 🟡 **Low**  
**Files:**
- [e2e/03-ingredients.spec.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/e2e/03-ingredients.spec.ts#L53)
- [e2e/04-recipes.spec.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/e2e/04-recipes.spec.ts#L79)
- [e2e/06-prep-sheets.spec.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/e2e/06-prep-sheets.spec.ts#L37-L42)
- [e2e/critical-flow.spec.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/e2e/critical-flow.spec.ts#L40-L63)

**TypeScript Errors:**
```
Argument of type '{ label: RegExp; }' is not assignable to parameter of type 'string | ...'
```

**Cause:**  
Playwright's `selectOption()` expects `string` for label, not `RegExp`.

**Recommended Fix:**
Use `getByText()` or `getByLabel()` with regex instead:

```typescript
// Current (wrong)
await page.locator('select').selectOption({ label: /Fresh Produce/ });

// Fixed
const option = page.getByRole('option', { name: /Fresh Produce/ });
await option.click();
```

### 3. parseFloat and String.replace Warnings
**Severity:** 🟡 **Low**  
**File:** [e2e/07-dashboard.spec.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/e2e/07-dashboard.spec.ts#L44-L112)

**Linting Warnings:**
- Prefer `Number.parseFloat` over `parseFloat`
- Prefer `String#replaceAll()` over `String#replace()`

**Recommended Fix:**
```typescript
// Before
const value = parseFloat(text.replace(/[^0-9.]/g, ''));

// After
const value = Number.parseFloat(text.replaceAll(/[^0-9.]/g, ''));
```

### 4. Unused Imports in Unit Tests
**Severity:** 🟡 **Low**  
**File:** [src/utils/__tests__/costEngine.test.ts](file:///i:/01-Master_Code/Apps/RestaurantManage/src/utils/__tests__/costEngine.test.ts)

**Status:** ✅ **FIXED** (removed old duplicate test file)

---

## Feature Gaps

### 1. User Authentication
**Severity:** 🔴 **High**  
**Priority:** P1

**Missing:**
- No user login/authentication
- No role-based access control
- No audit trail for who made changes

**Impact:**
- Multiple users can't use the app safely
- No accountability for changes
- Security risk if deployed in multi-user environment

**Recommended Implementation:**
- Add `users` table with hashed passwords
- Implement Tauri-based authentication
- Add `created_by` and `updated_by` fields to all tables
- Create audit log table

### 2. Multi-Currency Support
**Severity:** 🟡 **Medium**  
**Priority:** P2

**Missing:**
- All prices are in single currency
- No exchange rate support
- No currency selection

**Use Cases:**
- International suppliers
- Multi-location restaurants
- Import cost tracking

### 3. Production Planning
**Severity:** 🟡 **Medium**  
**Priority:** P2

**Missing:**
- No production schedule
- No batch production tracking
- No waste prediction

**Recommended:**
- Add production batches tracking
- Link prep sheets to actual production
- Track variance between planned and actual

### 4. Purchase Orders
**Severity:** 🟡 **Medium**  
**Priority:** P2

**Missing:**
- No PO generation from low stock
- No supplier order tracking
- No delivery confirmation

**Recommended:**
- Create `purchase_orders` table
- Generate POs from reorder reports
- Track order status (pending, received, partial)

### 5. Recipe Versioning
**Severity:** 🟡 **Medium**  
**Priority:** P3

**Missing:**
- No recipe history
- Can't track cost changes over time
- No rollback capability

**Impact:**
- Lost historical data when recipe is modified
- Can't analyze cost trends

### 6. Mobile App / Cloud Sync
**Severity:** 🟢 **Enhancement**  
**Priority:** P4

**Missing:**
- Desktop only (no mobile companion)
- No cloud backup
- No multi-device sync

**Consideration:**
- Tauri supports mobile (iOS/Android)
- Would need backend API for sync
- Consider Supabase or Firebase

---

## Testing Gaps

### 1. Unit Tests
**Severity:** 🟡 **Medium**  
**Status:** ✅ **COMPLETE**

**Test Coverage:**
- ✅ Cost engine calculations (**14 tests** - ingredient cost, recipe total, profit margin, suggested pricing)
- ✅ Unit conversions (**37 tests** - mass/volume conversions, error handling, edge cases, real-world scenarios)
- ✅ Inventory transaction logic (**40 tests** - stock deltas, cost calculations, low stock detection)
- ✅ Prep sheet aggregation (**27 tests** - recipe scaling, ingredient aggregation, sorting, JSON serialization)

**Test Files Created:**
```bash
src/utils/__tests__/
├── costEngine.test.ts           # ✅ 14 tests
└── conversions.test.ts          # ✅ 37 tests

src/features/inventory/__tests__/
└── inventory.business-logic.test.ts  # ✅ 40 tests

src/features/prep-sheets/__tests__/
└── prep-sheet-aggregation.test.ts   # ✅ 27 tests
```

**Total Unit Tests:** **118 passing** ✨

**All Core Business Logic Tested:**
- ✅ Mathematical calculations (cost engine)
- ✅ Unit conversions (mass/volume with error handling)
- ✅ Transaction processing (inventory deltas and stock updates)
- ✅ Data aggregation (prep sheet ingredient combination and scaling)

### 2. E2E Test UI Selectors
**Severity:** 🟡 **Medium**

**Issue:**
Test selectors may not match actual UI implementation.

**Examples:**
- Form field labels might differ
- Button text might change
- Data-testid attributes might be missing

**Recommended:**
- Run E2E tests against actual Tauri app
- Update selectors based on failures
- Add `data-testid` attributes to critical UI elements

### 3. Integration Tests Missing
**Severity:** 🟡 **Medium**

**Missing:**
- No tests for Tauri commands
- No tests for database migrations
- No tests for PDF generation

**Recommended:**
- Add Tauri command tests using `@tauri-apps/api/tauri`
- Test database schema is correctly applied
- Verify PDF export produces valid documents

### 4. Performance Testing
**Severity:** 🟢 **Low**

**Missing:**
- No load testing with large datasets
- No memory leak detection
- No render performance benchmarks

**Scenarios to Test:**
- 1000+ ingredients
- 500+ recipes with 20+ ingredients each
- Large inventory transaction history

---

## Performance Concerns

### 1. Full Table Scans
**Severity:** 🟡 **Medium**

**Issue:**
Some queries may perform full table scans without indexes.

**Recommended Indexes:**
```sql
-- Frequently searched/filtered columns
CREATE INDEX idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_inventory_transactions_ingredient ON inventory_transactions(ingredient_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(created_at);
```

### 2. N+1 Query Problem
**Severity:** 🟡 **Medium**

**Issue:**
Loading recipes with ingredients may cause N+1 queries.

**Example:**
```typescript
// Current: Load 100 recipes, then 100 separate queries for ingredients
const recipes = await recipesRepo.getAll();
for (const recipe of recipes) {
  recipe.ingredients = await recipesRepo.getIngredients(recipe.id); // N+1!
}
```

**Recommended Fix:**
Use JOIN queries or batch loading:
```sql
SELECT 
  r.*, 
  ri.quantity, 
  i.name as ingredient_name,
  i.price_per_unit
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
WHERE r.id IN (?, ?, ?)
```

### 3. Large Prep Sheet Rendering
**Severity:** 🟢 **Low**

**Issue:**
Rendering prep sheets with 50+ recipes might be slow.

**Recommended:**
- Implement virtualized scrolling
- Lazy load ingredient details
- Pagination for large lists

---

## UX Improvements

### 1. Search & Filter
**Priority:** P2

**Current State:**
- Basic search on some pages
- Limited filtering options

**Improvements Needed:**
- Advanced filters (date range, category, supplier)
- Saved filter presets
- Export filtered results

### 2. Bulk Operations
**Priority:** P2

**Missing:**
- No bulk delete
- No bulk price updates
- No batch ingredient creation

**Use Cases:**
- Update all supplier prices at once
- Delete multiple old recipes
- Import ingredients from CSV

### 3. Keyboard Navigation
**Priority:** P3

**Missing:**
- Limited keyboard shortcuts
- Tab navigation could be better
- No quick search hotkey

**Recommended:**
- `Ctrl+K` for global search
- `Ctrl+N` for new item
- Arrow keys for table navigation

### 4. Dark Mode
**Priority:** P3

**Status:**
- CSS variables support theming
- No dark mode toggle implemented

**Implementation:**
- Add theme switcher component
- Persist preference in localStorage
- Update color scheme CSS variables

### 5. Accessibility (a11y)
**Priority:** P2

**Gaps:**
- No ARIA labels on some interactive elements
- Keyboard-only navigation incomplete
- No screen reader testing

**Recommended:**
- Add ARIA landmarks
- Ensure all forms are accessible
- Test with NVDA/JAWS screen readers

---

## Documentation Gaps

### 1. API Documentation
**Severity:** 🟡 **Medium**

**Missing:**
- No JSDoc comments on most functions
- Repository methods lack examples
- Type definitions could be more descriptive

**Recommended:**
```typescript
/**
 * Calculates the total cost of a recipe including all ingredients.
 * 
 * @param items - Array of recipe ingredients with quantities and prices
 * @returns Object containing total cost and any conversion errors
 * @throws {Error} If ingredient units are incompatible
 * 
 * @example
 * ```typescript
 * const result = calculateRecipeTotal([
 *   { name: 'Flour', quantity: 500, unit: 'g', currentPricePerUnit: 2, ingredientUnit: 'kg' }
 * ]);
 * // result.totalCost = 1.00
 * ```
 */
export function calculateRecipeTotal(items: CostInputItem[]) { ... }
```

### 2. Deployment Guide
**Severity:** 🟡 **Medium**

**Missing:**
- No production build instructions
- No deployment checklist
- No troubleshooting guide

**Needed:**
- Build for Windows/Mac/Linux
- Code signing instructions
- Update/release process

### 3. User Manual
**Severity:** 🟡 **Medium**

**Missing:**
- No end-user documentation
- No tutorial/onboarding
- No FAQ

**Recommended:**
- Create user guide with screenshots
- Add in-app help/tooltips
- Video tutorials for complex workflows

### 4. Architecture Decision Records (ADR)
**Severity:** 🟢 **Low**

**Missing:**
- No ADRs documenting why certain tech choices were made
- No migration notes (e.g., why Tailwind v4)

**Recommended:**
Create `docs/adr/` folder with:
- `001-tauri-vs-electron.md`
- `002-kysely-vs-drizzle.md`
- `003-zustand-vs-redux.md`

---

## Priority Matrix

| Issue | Severity | Priority | Effort | Status |
|-------|----------|----------|--------|--------|
| User Authentication | 🔴 High | P1 | High | ❌ Open |
| Missing Unit Tests | 🟡 Medium | P1 | Medium | ✅ **Complete** (91 tests) |
| Database Connection Mock | 🟡 Medium | P2 | Low | ❌ Open |
| Multi-Currency Support | 🟡 Medium | P2 | High | ❌ Open |
| Purchase Orders | 🟡 Medium | P2 | Medium | ❌ Open |
| Performance Indexes | 🟡 Medium | P2 | Low | ❌ Open |
| E2E Test Selectors | 🟡 Medium | P2 | Low | ❌ Open |
| Bulk Operations | 🟡 Medium | P2 | Medium | ❌ Open |
| API Documentation | 🟡 Medium | P2 | Low | ❌ Open |
| CSS Linting Errors | 🟡 Low | P3 | Low | ❌ Open |
| RegExp Selector Errors | 🟡 Low | P3 | Low | ❌ Open |
| Accessibility | 🟡 Medium | P3 | Medium | ❌ Open |
| Dark Mode | 🟢 Low | P3 | Low | ❌ Open |
| Recipe Versioning | 🟡 Medium | P3 | Medium | ❌ Open |

---

## Quick Fixes Checklist

These can be addressed immediately:

- [ ] Fix CSS linting: Update Biome config to ignore Tailwind at-rules
- [ ] Fix Playwright selectors: Replace RegExp labels with proper selectors
- [ ] Fix parseFloat warnings: Use `Number.parseFloat` and `replaceAll()`
- [ ] Add database indexes for common queries
- [ ] Add JSDoc comments to public API functions
- [ ] Create unit tests for conversions utility
- [ ] Add data-testid attributes to key UI elements
- [ ] Update E2E tests with correct selectors after first run

---

## Long-Term Roadmap

### Phase 1: Quality & Stability (Current)
- ✅ Complete E2E test infrastructure
- ✅ Unit test coverage for cost engine
- ⏳ Fix linting issues
- ⏳ Add missing unit tests
- ⏳ Performance optimization (indexes)

### Phase 2: Core Features
- User authentication & authorization
- Purchase order management
- Multi-currency support
- Recipe versioning
- Advanced search & filters

### Phase 3: Enhancement
- Mobile app (Tauri mobile)
- Cloud sync / backup
- Bulk operations
- Dark mode
- Accessibility improvements

### Phase 4: Scale & Deploy
- Production deployment guide
- User documentation
- Video tutorials
- Performance testing at scale
- CI/CD pipeline

---

## Contributing to Fixes

When addressing issues from this document:

1. **Reference the issue** in commit messages
2. **Update this document** when issues are resolved
3. **Add tests** for bug fixes
4. **Update WIKI.md** if architecture changes

**Commit Message Format:**
```
fix(testing): resolve RegExp selector TypeScript errors in E2E tests

- Replace selectOption({ label: RegExp }) with getByRole/option pattern
- Update 4 test files: ingredients, recipes, prep-sheets, critical-flow
- Closes GAPS_ISSUES.md #2.2
```

---

## Legend

- 🔴 **High Severity:** Blocks features or causes errors
- 🟡 **Medium Severity:** Affects quality or maintainability
- 🟢 **Low Severity:** Minor improvements or nice-to-haves
- ✅ **Complete:** Issue resolved
- 🟡 **In Progress:** Currently being worked on
- ❌ **Open:** Not started
