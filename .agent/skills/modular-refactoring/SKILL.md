---
name: modular-refactoring
description: Pattern for refactoring monolithic React applications into a modular "Open Core" architecture with support for private extensions.
---

# Modular Refactoring Skill

This skill provides the architectural pattern and workflow for transforming a monolithic application into a plugin-based system.

## 🔑 Core Concepts

### 1. The Module Interface
Every feature must expose a standard interface.

```typescript
export interface Module {
  id: string;
  title: string;
  icon: any;
  component: React.ComponentType;
  order: number;
}
```

### 2. The Registry
A central registry manages the loaded modules.

```typescript
class ModuleRegistry {
  private modules: Map<string, Module> = new Map();

  register(module: Module) {
    this.modules.set(module.id, module);
  }

  getModules() {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }
}
```

## 🚀 Migration Workflow

### Step 1: Establish the Boundary
- Create `src/modules/core` for open source features.
- Create `src/modules/pro` for private features (add to `.gitignore` in public repo).

### Step 2: Decouple the UI
- **Sidebar**: Instead of hardcoded links, map over `Registry.getModules()`.
- **Router/App**: Use the `id` from the URL or state to look up the module in the Registry.

### Step 3: Git Submodule Setup
1. Create a private "Wrapper" repo.
2. Add the public repo as a submodule in `/core`.
3. Symlink `pro-features/` from the wrapper into `core/src/modules/pro`.

## ⚠️ Best Practices
- **Type Safety**: Use a shared `types` package if using a Monorepo.
- **Tree Shaking**: Ensure the registration logic doesn't bloat the bundle with unused modules.
- **Error Handling**: Implement a fallback view if a requested module fails to load.
