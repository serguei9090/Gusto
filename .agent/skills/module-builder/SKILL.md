---
name: module-builder
description: Use this skill when the user wants to create a new module, feature, widget, or plugin. It enforces the RestaurantManage modular architecture (Open Core vs. Pro Extensions) and sets up the required Atomic Design folder structure, Biome configuration, and module registration.
---

# Module Builder Skill

This skill guides you through creating a new feature module in the `src/modules` directory.

## When to Use This Skill

Use this skill when:
- Adding a new major feature (e.g., "Reservations", "Inventory", "Staff Management")
- Creating a new widget or plugin
- Setting up the "Pro" or "Core" version of a module

## Workflow

### Step 1: Determine Module Type & Name

Ask the user:
1. **Name**: What is the name of the module? (e.g., `inventory`, `reservations`)
2. **Type**: Is this a **Core** (Open Source) or **Pro** (Proprietary) module?
   - `Core` -> `src/modules/core/`
   - `Pro` -> `src/modules/pro/`

### Step 2: Create Module Structure

Run the following commands (replace `{type}` and `{name}`):

```bash
# Create base directory
mkdir -p src/modules/{type}/{name}

# Create Atomic Design structure inside the module
mkdir -p src/modules/{type}/{name}/components/atoms
mkdir -p src/modules/{type}/{name}/components/molecules
mkdir -p src/modules/{type}/{name}/components/organisms
mkdir -p src/modules/{type}/{name}/components/templates
mkdir -p src/modules/{type}/{name}/components/pages
mkdir -p src/modules/{type}/{name}/hooks
mkdir -p src/modules/{type}/{name}/store
mkdir -p src/modules/{type}/{name}/types
mkdir -p src/modules/{type}/{name}/utils
mkdir -p src/modules/{type}/{name}/assets
```

### Step 3: Create Configuration Files

Create `src/modules/{type}/{name}/package.json` (for local linking if needed, or just metadata):

```json
{
  "name": "@modules/{name}",
  "version": "0.0.1",
  "private": true
}
```

Create `src/modules/{type}/{name}/biome.json` (inheriting from root if possible, or standalone):

```json
{
  "extends": ["../../../../biome.json"],
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  }
}
```

### Step 4: Create Module Entry Point

Create `src/modules/{type}/{name}/index.tsx`:

```typescript
import { lazy } from 'react';
import type { Module } from '@/types/module'; // Adjust path to shared types

const ModuleComponent = lazy(() => import('./components/pages/MainPage'));

export const {Name}Module: Module = {
  id: '{name}',
  title: '{Title Case Name}',
  icon: 'Box', // Replace with actual icon name or component
  component: ModuleComponent,
  order: 100, // Ask user for order if relevant
  requiredPermissions: [], // Add if needed
};
```

Create `src/modules/{type}/{name}/components/pages/MainPage.tsx`:

```typescript
import React from 'react';

const MainPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{Title Case Name} Module</h1>
      <p>Welcome to the {Title Case Name} module.</p>
    </div>
  );
};

export default MainPage;
```

### Step 5: Register the Module

1. Open `src/modules/all-modules.ts` (or the central registry file).
2. Import the new module.
3. Add it to the `modules` array.

```typescript
import { {Name}Module } from './{type}/{name}';

export const allModules = [
  // ... existing modules
  {Name}Module,
];
```

### Step 6: Verify

Run:
```bash
bun run lint
bun run type-check
```

## Best Practices

- **Isolation**: Modules should strictly avoid importing from other modules' internal paths. Use shared `@/components` or `@/utils` for common code.
- **State**: Each module should have its own local state (Zustand store or Context) if complex.
- **Assets**: Store module-specific assets in `./assets`.
