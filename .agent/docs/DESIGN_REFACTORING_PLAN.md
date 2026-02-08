# Design Standards Refactoring Plan

## Status Overview

| Feature | Current Status | Needs Refactoring | Priority |
|---------|---------------|-------------------|----------|
| **Suppliers** | ✅ Compliant | No | - |
| **Ingredients** | ❌ Page-based forms | Yes | High |
| **Recipes** | ⚠️ Custom modal (white bg) | Yes | High |
| **Inventory** | 🔍 Needs Review | TBD | Medium |
| **Prep Sheets** | 🔍 Needs Review | TBD | Medium |

---

## Current Issues by Feature

### ❌ Ingredients (`src/features/ingredients/components/IngredientsPage.tsx`)

**Problems:**
1. Uses page-based forms instead of modals
2. Form replaces the entire content area when creating/editing
3. No visual separation between form and list view
4. User loses context of the data table

**Changes Needed:**
- [ ] Convert `IngredientForm` to open in a `Dialog` component
- [ ] Remove conditional rendering that replaces page content
- [ ] Keep data table always visible
- [ ] Add proper `DialogHeader` with title and description
- [ ] Update container to use standard pattern: `h-full flex flex-col space-y-6 p-8`
- [ ] Add ESC key handler for closing dialog

**Estimated Effort:** Medium (2-3 hours)

---

### ⚠️ Recipes (`src/features/recipes/components/RecipesPage.tsx`)

**Problems:**
1. Uses custom modal implementation instead of shadcn Dialog
2. White background (`bg-back ground`) makes focus difficult
3. Manual backdrop blur and positioning
4. Inconsistent with other modals

**Current Code:**
```tsx
{isFormOpen && (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-background border rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
      {/* Custom modal content */}
    </div>
  </div>
)}
```

**Changes Needed:**
- [ ] Replace custom modal with shadcn `Dialog` component
- [ ] Wrap `RecipeForm` in proper `DialogContent`
- [ ] Add `DialogHeader` with title and description
- [ ] Remove custom backdrop and container divs
- [ ] Use theme-aware backgrounds (`bg-card`)
- [ ] Ensure dialog size is appropriate: `sm:max-w-[800px]`

**Estimated Effort:** Low (1-2 hours)

---

### 🔍 Inventory (Needs Review)

**Action:** Review current implementation and determine compliance level

---

### 🔍 Prep Sheets (Needs Review)

**Action:** Review current implementation and determine compliance level

---

## Refactoring Priority Order

1. **Recipes** (Quick win, low effort)
   - Simple migration to Dialog component
   - Immediate visual improvement

2. **Ingredients** (High impact, medium effort)
   - Requires restructuring but high user value
   - Most noticeable improvement

3. **Inventory & Prep Sheets** (After review)
   - Assess and prioritize based on findings

---

## Testing Checklist (For Each Refactor)

After refactoring each feature, verify:

- [ ] Create new item opens modal, not page replacement
- [ ] Edit item opens modal with pre-filled data
- [ ] ESC key closes modals
- [ ] Click outside modal closes it (default Dialog behavior)
- [ ] Form validation works correctly
- [ ] Loading states display properly
- [ ] Error messages show clearly
- [ ] Modal backdrop blur is visible
- [ ] Focus management works (modal receives focus on open)
- [ ] Data table remains visible when modal is open (blurred background)

---

## Next Steps

1. ✅ **Document Created** - Design standards established
2. **Review & Approve** - Team reviews standards document
3. **Refactor Recipes** - Quick win, establish pattern
4. **Refactor Ingredients** - Largest user impact
5. **Review Remaining Features** - Inventory, Prep Sheets
6. **Future Enforcement** - All new features follow standards

---

## Reference

See `.agent/docs/DESIGN_STANDARDS.md` for complete implementation guidelines.
