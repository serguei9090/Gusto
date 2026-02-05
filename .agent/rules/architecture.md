# Architecture & Naming Rules

---

## 📂 Architecture Rules

### 1. Atomic Design MUST Be Followed

All UI components MUST follow this hierarchy:

```
src/components/
├── atoms/        ← Basic elements (Button, Input, Label, Icon)
├── molecules/    ← Simple combinations (FormField, SearchBar)
├── organisms/    ← Complex sections (RecipeForm, InventoryTable)
├── templates/    ← Page layouts (MainLayout, DashboardLayout)
└── pages/        ← Complete pages (Dashboard, Recipes, Inventory)
```

**Rules:**
- Atoms CANNOT import other atoms
- Molecules CAN import atoms
- Organisms CAN import atoms and molecules
- Templates CAN import organisms, molecules, and atoms
- Pages CAN import templates and organisms

### 2. Component Structure

Each component MUST have:
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
└── index.ts
```

**index.ts pattern:**
```typescript
export { ComponentName } from "./ComponentName";
export type { ComponentNameProps } from "./ComponentName";
```

### 3. Naming Conventions

- **Files:** PascalCase for components (`Button.tsx`), camelCase for utilities (`formatCurrency.ts`)
- **Components:** PascalCase (`Button`, `RecipeForm`)
- **Hooks:** camelCase with `use` prefix (`useRecipes`, `useDebounce`)
- **Services:** camelCase with `.service.ts` suffix (`ingredients.service.ts`)
- **Stores:** camelCase with `Store` suffix (`ingredientStore.ts`)
- **Types:** PascalCase with `.types.ts` suffix (`ingredient.types.ts`)

---

**Last Updated:** 2026-02-04
