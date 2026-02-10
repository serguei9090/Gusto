# Gusto Project Standards & Rules

This document outlines the mandatory architectural, coding, and styling standards for the Gusto project. All developers (AI and human) MUST follow these rules to ensure consistency, maintainability, and high performance.

---

## 🏗️ 1. Project Architecture

### 1.1 Atomic Design (Pragmatic Model)
We follow a modified Atomic Design structure optimized for Shadcn/UI and Tailwind CSS.

| Level | Location | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **Primitives** | `src/components/ui` | **Shadcn/UI components**. Standard, unstyled primitives. Do not modify directly. | `Button`, `Input`, `Dialog` |
| **Atoms** | `src/components/atoms` | Smallest functional units with **domain logic**. Often wrap Primitives. | `StatusBadge`, `PriceDisplay`, `UserAvatar` |
| **Molecules** | `src/components/molecules` | Simple combinations of atoms. Handles local interaction logic. | `SearchBar`, `QuantityCounter`, `IngredientRow` |
| **Organisms** | `src/components/organisms` | Complex, data-aware UI sections. Often interact with Stores/Services. | `RecipeEditor`, `InventoryTable`, `SupplierList` |
| **Templates** | `src/components/templates` | Page-level layout structures (no real data). | `DashboardLayout`, `AuthLayout` |
| **Pages** | `src/components/pages` | Composed organisms with real data and module-specific logic. | `IngredientsPage`, `SettingsPage` |

### 1.2 Modular Core (Open Core vs. Pro)
- **Core Modules**: `src/modules/core/` (Open source features).
- **Pro Modules**: `src/modules/pro/` (Proprietary extensions).
- **Module Interface**: Every module must follow the standard `Module` interface and register itself in the central registry.
- **Isolation**: Modules should strictly avoid importing from other modules' internal paths. Use `@/components` or `@/lib` for shared code.

---

## 🎨 2. Styling & UI

### 2.1 Tailwind CSS v4
- **Single Source of Truth**: Use Tailwind utility classes for **ALL** styling.
- **No CSS Modules**: Deprecate and remove all `.module.css` files.
- **Theme Variables**: Use `@theme` in `src/index.css` for design tokens (colors, spacing, shadows).
- **Class Merging**: Always use the `cn()` utility (from `@/lib/utils`) when handling dynamic classes or `className` props.

### 2.2 Frameworks
- **Animations**: Use `framer-motion` for transitions and micro-interactions.
- **Icons**: Use `lucide-react` for consistent iconography.

---

## 🛡️ 3. Type Safety & Logic

### 3.1 Strict TypeScript
- **No `any` usage**: Use `unknown` or specific interfaces. If a library requires `any`, use `// biome-ignore lint/suspicious/noExplicitAny: <reason>`.
- **Database Casting**: Always cast database results to specific Zod-validated schemas or interfaces.
- **Exhaustive Dependencies**: `useEffect`, `useCallback`, and `useMemo` must have full dependency arrays.

### 3.2 State Management
- **Zustand**: Use for global application state (e.g., Auth, Theme, Sidebar).
- **Local State**: Use `useState`/`useReducer` for specific UI interactions within molecules/atoms.

---

## 🧪 4. Testing & Quality Control

### 4.1 Testing Standards
- **Unit/Integration**: Use `Vitest` for logic and hook testing.
- **E2E**: Use `Playwright` for critical user flows.
- **Stable Selectors**: Use `data-testid` or ARIA labels. For `selectOption`, use string labels: `{ label: "Name" }`.

### 4.2 Quality Guardrails
- **Mandatory Consult**: Before coding, consult the `code-quality-consultant` skill.
- **Biome**: Primary tool for linting and formatting (Indent: 2 spaces, Braces: Spaces inside).
- **Lefthook**: Enforces linting and type-checking on every commit.

---

## 📜 5. General Best Practices
- **Modern APIs**: Use `Number.isFinite`, `globalThis`, and `String.replaceAll`.
- **Clean Code**: Remove unused imports, `@ts-ignore` comments, and `console.log` before committing. Use the `logger` utility if verbose output is needed.
- **Semantic HTML**: Always use appropriate tags (`<button>`, `<main>`, `<nav>`, etc.) for accessibility.
