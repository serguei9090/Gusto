---
trigger: always_on
---

# Architecture & Naming Rules

## 📂 Architecture Rules

### 1. Atomic Design (Pragmatic Model)
We follow a modified Atomic Design structure optimized for **Shadcn/UI** and **Tailwind CSS**.

| Level | Location | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **Primitives** | `src/components/ui` | **Shadcn/UI components**. Standard, unstyled primitives. Do not modify directly. | `Button`, `Input`, `Dialog` |
| **Atoms** | `src/components/atoms` | Smallest functional units with **domain logic**. Often wrap Primitives. | `StatusBadge`, `PriceDisplay`, `UserAvatar` |
| **Molecules** | `src/components/molecules` | Simple combinations of atoms. Handles local interaction logic. | `SearchBar`, `QuantityCounter`, `IngredientRow` |
| **Organisms** | `src/components/organisms` | Complex, data-aware UI sections. Often interact with Stores/Services. | `RecipeEditor`, `InventoryTable`, `SupplierList` |
| **Templates** | `src/components/templates` | Page-level layout structures (no real data). | `DashboardLayout`, `AuthLayout` |
| **Pages** | `src/components/pages` | Composed organisms with real data and module-specific logic. | `IngredientsPage`, `SettingsPage` |

### 2. Component Structure

Each component MUST follow this structure (using `index.ts` for clean exports):

```
ComponentName/
├── ComponentName.tsx  ← Main component file
└── index.ts           ← Exports
```

**index.ts pattern:**
```typescript
export { ComponentName } from "./ComponentName";
export type { ComponentNameProps } from "./ComponentName"; // If separate type export needed
```

**Note:** We do NOT use `.module.css` files. All styling must be done via Tailwind utility classes.

### 3. Naming Conventions

- **Files:** PascalCase for components (`Button.tsx`), camelCase for utilities (`formatCurrency.ts`)
- **Components:** PascalCase (`Button`, `RecipeForm`)
- **Hooks:** camelCase with `use` prefix (`useRecipes`, `useDebounce`)
- **Services:** camelCase with `.service.ts` suffix (`ingredients.service.ts`)
- **Stores:** camelCase with `Store` suffix (`ingredientStore.ts`)
- **Types:** PascalCase with `.types.ts` suffix (`ingredient.types.ts`)

---

**Last Updated:** 2026-02-15
