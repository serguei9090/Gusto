# Form & Modal Design Standards

## Problem Statement
Different features (Ingredients, Recipes, Suppliers, Inventory) were using inconsistent patterns:
- **Suppliers**: Clean modal-based forms with good visual separation ✅
- **Ingredients**: Page-based forms that feel disconnected from the list ❌
- **Recipes**: Custom modal implementation (white background, hard to focus) ⚠️

**Goal**: Establish a single, consistent pattern across all CRUD interfaces.

---

## ✅ Standard Pattern: Modal-Based Forms

### Why Modals?
1. **Visual Focus**: Dims the background, keeping attention on the form
2. **Context Preservation**: User sees where they came from
3. **Consistent UX**: Same interaction pattern everywhere
4. **Cleaner Pages**: Main page stays focused on data display

### Core Pattern Structure

```tsx
// Page Component Pattern
export const [Feature]Page = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      {/* Header Section */}
      <PageHeader />
      
      {/* Stats/Summary Cards (optional) */}
      <StatsCards />
      
      {/* Separator (if stats exist) */}
      <Separator />
      
      {/* Search & Filters */}
      <SearchBar />
      
      {/* Data Table Container */}
      <div className="flex-1 overflow-auto bg-card rounded-md border shadow-sm">
        <DataTable />
      </div>
      
      {/* Form Modal (Dialog component) */}
      <FormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
      />
      
      {/* Detail View Modal (optional) */}
      <DetailModal 
        item={viewingItem}
        onClose={() => setViewingItem(null)}
      />
    </div>
  );
};
```

---

## 🎨 Visual Design Standards

### Container Styles

#### Page Container
```tsx
className="h-full flex flex-col space-y-6 p-8"
```
- `h-full`: Full viewport height
- `flex flex-col`: Vertical layout
- `space-y-6`: Consistent spacing between sections
- `p-8`: Consistent padding

#### Data Table Container
```tsx
className="flex-1 overflow-auto bg-card rounded-md border shadow-sm"
```
- `flex-1`: Takes remaining space
- `overflow-auto`: Scrollable if needed
- `bg-card`: Uses theme card background
- `rounded-md border shadow-sm`: Subtle depth

### Header Pattern
```tsx
<div className="flex items-center justify-between space-y-2">
  <div>
    <h2 className="text-3xl font-bold tracking-tight">
      {t("feature.title")}
    </h2>
    <p className="text-muted-foreground">{t("feature.subtitle")}</p>
  </div>
  <div className="flex items-center space-x-2">
    <Button onClick={() => setIsFormOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      {t("feature.addItem")}
    </Button>
  </div>
</div>
```

### Search Bar Pattern
```tsx
<div className="flex items-center space-x-2">
  <div className="relative flex-1 max-w-sm">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={t("feature.searchPlaceholder")}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-8"
    />
  </div>
</div>
```

---

## 📋 Modal Dialog Standards

### Use Shadcn Dialog Component

**Always use the standard Dialog component** - no custom modal implementations.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEditing ? "Edit Item" : "Add Item"}</DialogTitle>
      <DialogDescription>
        Fill out the form below to create or update an item.
      </DialogDescription>
    </DialogHeader>
    <FormComponent />
  </DialogContent>
</Dialog>
```

### Dialog Size Guidelines
- **Small forms** (3-5 fields): `sm:max-w-[500px]`
- **Medium forms** (6-10 fields): `sm:max-w-[600px]` ← Most common
- **Large forms** (10+ fields, complex): `sm:max-w-[800px]` or `sm:max-w-[900px]`

### Always Include
- `max-h-[90vh]`: Prevents overflow on small screens
- `overflow-y-auto`: Scrollable content if needed
- `DialogHeader`: Title and description for accessibility

---

## 🚫 Anti-Patterns (Don't Do This)

### ❌ Page-Based Forms
```tsx
// DON'T: Replace the entire page with a form
if (isCreating) {
  return <div className="p-6"><FormComponent /></div>;
}
```
**Why**: Loses context, feels like navigation instead of an action

### ❌ Custom Modal Implementation
```tsx
// DON'T: Build custom modals
<div className="fixed inset-0 bg-background/80">
  <div className="bg-background border rounded-lg">
    {/* Custom modal content */}
  </div>
</div>
```
**Why**: Inconsistent styling, missing accessibility features, harder to maintain

### ❌ White Background Forms in Modals
```tsx
// DON'T: Use pure white backgrounds
<DialogContent className="bg-white">
```
**Why**: No visual separation from card components, hurts focus

---

## ✅ Best Practices Summary

### 1. **Modal-First Approach**
- Create/Edit → Dialog Modal
- View Details → Dialog Modal (optional, read-only)
- Main page → Data table only

### 2. **Consistent Container Structure**
```
Page Container (p-8, space-y-6)
├── Header (title + action buttons)
├── Stats Cards (optional)
├── Separator (if stats exist)
├── Search/Filters
└── Data Table Container (flex-1, scrollable)
```

### 3. **Use Theme Colors**
- Background: `bg-card` (not `bg-white`)
- Text: `text-foreground` / `text-muted-foreground`
- Borders: `border` (uses theme border color)

### 4. **Accessibility**
- ESC key closes modals
- Proper DialogHeader with title and description
- Form labels for all inputs
- Loading states clearly indicated

### 5. **State Management**
```tsx
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingItem, setEditingItem] = useState<Item | null>(null);
const [viewingItem, setViewingItem] = useState<Item | null>(null);
```

---

## 📝 Implementation Checklist

When creating/refactoring a CRUD feature:

- [ ] Page uses `h-full flex flex-col space-y-6 p-8` container
- [ ] Header follows standard pattern (title + subtitle + action button)
- [ ] Data table in `flex-1 overflow-auto bg-card rounded-md border shadow-sm` container
- [ ] Forms use shadcn `Dialog` component (not custom modals)
- [ ] Forms use shadcn `Form` component for validation
- [ ] Dialog has proper `DialogHeader` with title and description
- [ ] ESC key handler for closing modals
- [ ] Consistent spacing and theming
- [ ] Loading states handled gracefully
- [ ] Error messages displayed consistently

---

## 🔗 Reference Implementation

**Gold Standard**: `src/features/suppliers/components/SuppliersPage.tsx`

This implementation follows all standards and should be used as the template for other features.

---

## Notes

- This standard was established on 2026-02-07
- All existing features should be migrated to this pattern
- New features MUST follow this standard from the start
