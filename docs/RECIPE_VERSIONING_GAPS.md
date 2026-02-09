# Recipe Versioning Gaps & Future Proposals

This document outlines the current limitations of the recipe versioning system and proposes features for future iterations.

## Current Gaps

### 1. Diff Visualization
Currently, users can view a past version in its entirety, but there is no side-by-side comparison to highlight exactly what changed (e.g., "Tomato Quantity: 5kg -> 6kg").
- **Gap:** No visual "diff" interface.
- **Impact:** Users must manually toggle between versions to spot subtle changes.

### 2. Ingredient-Level Tracking
While we capture a snapshot of ingredients, we do not have a dedicated view to see the price history of a *single ingredient* across all recipes it is used in within the versioning UI.
- **Gap:** Logic exists in `costEngine`, but no UI to trace "How has the cost of Onions affected my recipes over the last year?" from the recipe view.

### 3. Version Descriptions
Versions are auto-incremented. Users cannot tag a specific version as "Summer Menu 2025" or "Test Batch".
- **Gap:** No "Tagging" or "Naming" system for versions beyond the simple change note.

## Proposed Features

### 1. Visual Diff Tool
Implement a comparison view that shows two columns (Version A vs Version B) and highlights:
- **Red:** Deleted items or decreased values.
- **Green:** Added items or increased values.
- **Yellow:** Modified text.

### 2. Experiments & Variants
Allow chefs to create an "Experiment" copy of a recipe (e.g., "Pizza Dough - Gluten Free Test") that is linked to the original but exists independently.
- **Use Case:** Testing a variation without altering the main recipe's history. If the experiment is successful, it can be saved as a new recipe or manually used to update the original.

### 3. Bulk Rollback
If a bad ingredient update affects 50 recipes (e.g., incorrect price entry), allow a system-wide rollback for that specific batch of updates.

### 4. Export History
Allow exporting the full audit trail of a recipe (including costs and margins at each point) to CSV/PDF for accounting purposes.
