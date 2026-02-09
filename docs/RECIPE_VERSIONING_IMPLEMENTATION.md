# Recipe Versioning Implementation

## Overview
Implemented comprehensive recipe versioning system for the RestaurantManage application, enabling historical tracking, cost trend analysis, and rollback capability for all recipes.

## Database Schema

### New Table: `recipe_versions`

Stores complete snapshots of recipes at different points in time.

```sql
CREATE TABLE recipe_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Recipe data snapshot
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  servings INTEGER NOT NULL,
  prep_time_minutes INTEGER,
  cooking_instructions TEXT,
  selling_price REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  target_cost_percentage REAL,
  waste_buffer_percentage REAL,
  total_cost REAL,
  profit_margin REAL,
  
  -- Ingredients snapshot (JSON)
  ingredients_snapshot TEXT NOT NULL,
  
  -- Change tracking
  change_reason TEXT,
  change_notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_current INTEGER NOT NULL DEFAULT 0,
  
  UNIQUE(recipe_id, version_number)
);
```

### Updated Table: `recipes`

Added version tracking columns:

```sql
ALTER TABLE recipes 
ADD COLUMN current_version INTEGER DEFAULT 1;

ALTER TABLE recipes 
ADD COLUMN last_version_date TEXT;
```

### Indexes

```sql
CREATE INDEX idx_recipe_versions_recipe_id ON recipe_versions(recipe_id);
CREATE INDEX idx_recipe_versions_current ON recipe_versions(recipe_id, is_current);
CREATE UNIQUE INDEX idx_recipe_versions_unique ON recipe_versions(recipe_id, version_number);
```

## Architecture

### 1. Migration (`003_add_recipe_versioning.ts`)

**Features:**
- Creates `recipe_versions` table with all necessary columns
- Adds version tracking columns to `recipes` table
- Creates indexes for efficient querying
- Automatically creates initial versions for all existing recipes
- Uses raw SQL for data migration to avoid type issues

**Initial Version Creation:**
- Queries all existing recipes
- For each recipe, fetches its current ingredients
- Creates version 1 with current recipe state
- Stores ingredients as JSON snapshot
- Marks version as current (`is_current = 1`)

### 2. Repository Layer (`recipeVersion.repository.ts`)

Provides comprehensive version management:

#### Core Methods

**`createVersion(input)`**
- Creates a new version of a recipe
- Automatically increments version number
- Marks previous versions as not current
- Stores complete recipe snapshot including ingredients
- Updates recipe's `current_version` and `last_version_date`

**`getVersions(recipeId)`**
- Returns all versions for a recipe
- Ordered by version number (newest first)
- Includes full recipe data and ingredients snapshot

**`getVersion(recipeId, versionNumber)`**
- Gets a specific version
- Returns null if not found

**`getCurrentVersion(recipeId)`**
- Gets the current active version
- Uses `is_current = 1` flag for efficiency

**`rollbackToVersion(recipeId, versionNumber, reason?)`**
- Restores recipe to a previous version
- Updates recipe table with version data
- Deletes and recreates recipe ingredients
- Creates a new version to record the rollback
- Includes optional reason for rollback

**`compareVersions(recipeId, version1, version2)`**
- Compares two versions field by field
- Returns array of `VersionComparison` objects
- Shows what changed between versions
- Includes ingredients comparison

**`getCostHistory(recipeId)`**
- Returns cost history over time
- Useful for trend analysis
- Ordered by version number

**`pruneOldVersions(recipeId, keepCount)`**
- Deletes old versions (keeps last N)
- Never deletes current version
- Returns number of deleted versions
- Useful for database maintenance

## Data Structures

### RecipeVersion Interface

```typescript
interface RecipeVersion {
  id: number;
  recipeId: number;
  versionNumber: number;
  name: string;
  description: string | null;
  category: string | null;
  servings: number;
  prepTimeMinutes: number | null;
  cookingInstructions: string | null;
  sellingPrice: number | null;
  currency: string;
  targetCostPercentage: number | null;
  wasteBufferPercentage: number | null;
  totalCost: number | null;
  profitMargin: number | null;
  ingredientsSnapshot: Array<{
    id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    cost: number | null;
    notes: string | null;
  }>;
  changeReason: string | null;
  changeNotes: string | null;
  createdBy: string | null;
  createdAt: string;
  isCurrent: boolean;
}
```

### VersionComparison Interface

```typescript
interface VersionComparison {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}
```

## Usage Examples

### Creating a New Version

```typescript
import { recipeVersionRepository } from '@/features/recipes/services/recipeVersion.repository';

// When updating a recipe
await recipeVersionRepository.createVersion({
  recipeId: 123,
  changeReason: 'Updated ingredient quantities',
  changeNotes: 'Adjusted for better taste based on customer feedback',
  createdBy: 'chef@restaurant.com'
});
```

### Viewing Version History

```typescript
// Get all versions
const versions = await recipeVersionRepository.getVersions(123);

console.log(`Recipe has ${versions.length} versions`);
versions.forEach(v => {
  console.log(`Version ${v.versionNumber}: ${v.name} (${v.createdAt})`);
  console.log(`  Reason: ${v.changeReason}`);
  console.log(`  Cost: $${v.totalCost}`);
});
```

### Comparing Versions

```typescript
// Compare version 2 with version 5
const comparison = await recipeVersionRepository.compareVersions(123, 2, 5);

comparison.forEach(diff => {
  if (diff.changed) {
    console.log(`${diff.field} changed:`);
    console.log(`  From: ${JSON.stringify(diff.oldValue)}`);
    console.log(`  To: ${JSON.stringify(diff.newValue)}`);
  }
});
```

### Rolling Back to Previous Version

```typescript
// Rollback to version 3
await recipeVersionRepository.rollbackToVersion(
  123,
  3,
  'Customer complaints about new recipe'
);

// This will:
// 1. Restore recipe data from version 3
// 2. Restore ingredients from version 3
// 3. Create a new version (e.g., version 6) recording the rollback
```

### Analyzing Cost Trends

```typescript
const costHistory = await recipeVersionRepository.getCostHistory(123);

console.log('Cost Trend:');
costHistory.forEach(({ version, totalCost, date }) => {
  console.log(`Version ${version} (${date}): $${totalCost.toFixed(2)}`);
});

// Calculate cost increase
const firstCost = costHistory[0].totalCost;
const lastCost = costHistory[costHistory.length - 1].totalCost;
const increase = ((lastCost - firstCost) / firstCost) * 100;
console.log(`Total cost increase: ${increase.toFixed(1)}%`);
```

### Pruning Old Versions

```typescript
// Keep only last 10 versions
const deleted = await recipeVersionRepository.pruneOldVersions(123, 10);
console.log(`Deleted ${deleted} old versions`);
```

## Workflow Integration

### Automatic Versioning on Recipe Update

When integrating with the recipe update workflow:

```typescript
// In recipe update handler
async function updateRecipe(recipeId: number, updates: RecipeUpdate) {
  // 1. Create version before updating
  await recipeVersionRepository.createVersion({
    recipeId,
    changeReason: updates.changeReason,
    changeNotes: updates.changeNotes,
    createdBy: currentUser.email
  });
  
  // 2. Update recipe
  await recipeRepository.update(recipeId, updates);
  
  // 3. Version is now saved with old state
}
```

### Version History UI

Suggested UI components:

1. **Version List**
   - Show all versions with date, author, reason
   - Click to view details
   - Button to rollback

2. **Version Detail View**
   - Show complete recipe state
   - Show ingredients snapshot
   - Compare with current version button

3. **Version Comparison View**
   - Side-by-side comparison
   - Highlight changed fields
   - Show ingredient differences

4. **Cost Trend Chart**
   - Line chart showing cost over time
   - X-axis: Version number or date
   - Y-axis: Total cost
   - Hover to see details

## Benefits

### 1. Historical Tracking
- Never lose recipe data
- See how recipes evolved over time
- Track who made changes and why

### 2. Cost Analysis
- Identify cost increases
- Analyze impact of ingredient changes
- Forecast future costs based on trends

### 3. Rollback Capability
- Quickly revert problematic changes
- Test recipe variations safely
- Restore accidentally deleted data

### 4. Audit Trail
- Complete change history
- Change reasons and notes
- User attribution

### 5. Business Intelligence
- Analyze recipe optimization efforts
- Track cost reduction initiatives
- Identify most stable vs. frequently changed recipes

## Performance Considerations

### 1. Storage
- Each version stores complete recipe snapshot
- Ingredients stored as JSON (compact)
- Use `pruneOldVersions()` for maintenance

### 2. Query Optimization
- Indexes on `recipe_id` and `is_current`
- Unique index on `recipe_id + version_number`
- Efficient queries for current version

### 3. JSON Parsing
- Ingredients snapshot parsed on read
- Minimal overhead for small ingredient lists
- Consider pagination for very large version histories

## Migration Path

### For Existing Databases

1. **Run Migration:**
```typescript
import { migration } from '@/services/database/migrations/003_add_recipe_versioning';
await migration.up(db);
```

2. **Verify Initial Versions:**
```sql
SELECT recipe_id, COUNT(*) as version_count 
FROM recipe_versions 
GROUP BY recipe_id;
```

3. **Check Current Versions:**
```sql
SELECT r.id, r.name, r.current_version, rv.version_number
FROM recipes r
LEFT JOIN recipe_versions rv ON r.id = rv.recipe_id AND rv.is_current = 1;
```

## Testing Considerations

### Unit Tests
- Test version creation
- Test rollback functionality
- Test version comparison
- Test cost history calculation
- Test pruning logic

### Integration Tests
- Test version creation on recipe update
- Test rollback restores correct state
- Test version history retrieval
- Test concurrent version creation

### E2E Tests
- Test creating recipe versions through UI
- Test viewing version history
- Test comparing versions
- Test rolling back versions
- Test cost trend visualization

## UI Implementation

### Components created:

1.  **RecipeHistory (`RecipeHistory.tsx`)**
    *   Displays a scrollable list of all past versions.
    *   Shows key metrics for each version: Cost, Margin, Selling Price (including estimated), and Ingredient count.
    *   Provides "View" button to open a detailed modal for a specific version.
    *   Provides "Restore" button to rollback to a previous version (with confirmation).

2.  **RecipeOverview (`RecipeOverview.tsx`)**
    *   Reusable component that renders the full details of a recipe.
    *   Used in both the "Overview" tab of the live recipe and the "Version Detail" dialog.
    *   Displays header info, cost summary cards, ingredients table, and cooking instructions.

3.  **RecipeDetailModal (`RecipeDetailModal.tsx`)**
    *   Integrated `RecipeHistory` into a "Version History" tab.
    *   Uses `RecipeOverview` for the main view.

### Key Logic:

*   **Price Estimation:** In the history view, if a past version did not have a manual selling price, the system calculates and displays an "Estimated" price based on the total cost and target margin at that time.
*   **Deep Viewing:** Users can click "View" on any history item to open a `z-index` layered dialog showing the exact state of the recipe at that point in time.

## Conclusion

The recipe versioning system provides a robust foundation for tracking recipe changes over time. It enables historical analysis, cost trend tracking, and safe experimentation with recipe modifications. The implementation is type-safe, performant, and now fully integrated into the UI.

User-facing components for viewing version history, examining detailed snapshots, and performing rollbacks are fully functional.

## Future Enhancements

## Recently Implemented Enhancements (completed)

1.  **Visual Diff Tool** (Phase 1)
    - Side-by-side comparison of any 2 recipe versions.
    - Color-coded changes: 🟢 Added, 🔴 Removed, 🟡 Modified.
    - Automatic percentage calculation for cost and margin changes.
    - Detailed ingredient-level diffing.

2.  **Export History** (Phase 2)
    - Export full version history for any recipe to CSV.
    - Includes date, creator, reason, costs, and ingredient counts.

3.  **Experiments & Variants** (Phase 3)
    - Create independent experiment copies of recipes.
    - Identified by `Beaker` icon and experiment name.
    - "Apply to Original" feature to merge experiment findings back to the main recipe.
    - Experiments displayed in the main recipe list for easy access.

4.  **Bulk Rollback** (Phase 4)
    - System-wide rollback capability.
    - Revert all recipes to their state at a specific point in time.
    - Multi-step confirmation to prevent accidental data loss.

---

## Future Roadmap

1.  **Version Tags**
    - Tag important versions (e.g., "Production", "Testing").
    - Filter by tags.

2.  **Automated Versioning**
    - Auto-create versions on schedule.
    - Version on significant cost changes (> 5% fluctuation).

3.  **PDF Export**
    - Generate professional PDF version reports.
