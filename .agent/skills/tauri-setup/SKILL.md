---
name: tauri-setup
description: Initialize and configure Tauri + React + TypeScript projects following RestaurantManage standards with Bun, Drizzle ORM, and proper project structure.
---

# Tauri Setup Skill

This skill guides you through setting up a **Tauri 2.x + React 19 + TypeScript + Bun** desktop application following the RestaurantManage project standards.

## When to Use This Skill

Use this skill when:
- Initializing a new Tauri project from scratch
- Setting up the development environment for RestaurantManage
- Configuring a similar desktop application with SQLite + Drizzle ORM
- Need to scaffold the Atomic Design folder structure

## Prerequisites

Before running this skill, ensure:
1. **Bun** is installed (`bun --version`)
2. **Tauri prerequisites** are installed (Rust, C++ build tools)
   - Windows: https://tauri.app/v1/guides/getting-started/prerequisites#windows
3. You have the `PROJECT_PLAN.md` and `RULES.md` available for reference

## Step-by-Step Setup Process

### Step 1: Initialize Tauri Project

```bash
# Create Tauri app with Vite + React + TypeScript
bun create tauri-app

# When prompted, select:
# - Package manager: bun
# - UI Template: React
# - TypeScript: Yes
# - Variant: TypeScript
```

**Alternative (if you want more control):**
```bash
# Manual initialization
bun create vite . --template react-ts
bun add -D @tauri-apps/cli
bun add @tauri-apps/api
bunx tauri init
```

### Step 2: Install Core Dependencies

```bash
# State Management & Data
bun add zustand zod

# Animation
bun add framer-motion

# Database
bun add drizzle-orm better-sqlite3
bun add -D drizzle-kit @types/better-sqlite3

# Utilities
bun add date-fns clsx

# Tauri Plugins (if needed)
bun add @tauri-apps/plugin-sql
```

### Step 3: Install Development Tools

```bash
# Linting & Formatting
bun add -D @biomejs/biome

# Testing
bun add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
bun add -D playwright @playwright/test

# Git Hooks (if not already installed globally)
bun add -D lefthook
```

### Step 4: Configure Biome

Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      },
      "complexity": {
        "noForEach": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  }
}
```

### Step 5: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting - STRICT MODE */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    
    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/store/*": ["./src/store/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/assets/*": ["./src/assets/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 6: Configure Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### Step 7: Setup Lefthook

Create `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    js-quality:
      glob: "*.{js,ts,jsx,tsx,json}"
      run: bun x @biomejs/biome check --apply {staged_files}
    type-check:
      glob: "*.{ts,tsx}"
      run: bunx tsc --noEmit

pre-push:
  commands:
    tests:
      run: bun test
```

Install hooks:
```bash
bunx lefthook install
```

### Step 8: Create Atomic Design Folder Structure

```bash
# Create all directories at once
mkdir -p src/components/atoms src/components/molecules src/components/organisms src/components/templates src/components/pages src/store src/hooks src/services/database src/services src/utils src/types src/assets/icons src/assets/images src/assets/fonts src/styles
```

### Step 9: Setup Design System

Create `src/styles/index.css`:

```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Design Tokens */
:root {
  /* Colors - Restaurant Theme */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;
  --color-primary-700: #15803d;

  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-500: #737373;
  --color-neutral-700: #404040;
  --color-neutral-900: #171717;

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Surfaces */
  --surface-base: #ffffff;
  --surface-elevated: #fafafa;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  font-family: var(--font-sans);
  background: var(--surface-base);
  color: var(--color-neutral-900);
  line-height: 1.5;
}
```

### Step 9: Setup Design System (Tailwind v4)

Update `src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Colors - Restaurant Theme */
  --color-primary: #22c55e;
  --color-primary-foreground: #ffffff;
  
  --color-secondary: #f4f4f5;
  --color-secondary-foreground: #18181b;
  
  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;
  
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
  
  --color-accent: #f4f4f5;
  --color-accent-foreground: #18181b;
  
  --color-popover: #ffffff;
  --color-popover-foreground: #09090b;

  --color-card: #ffffff;
  --color-card-foreground: #09090b;

  /* Border Radius */
  --radius: 0.5rem;
}

@layer base {
  * {
    @apply border-gray-200;
  }
  body {
    @apply bg-white text-gray-900;
  }
}
```

### Step 10: Setup Kysely Database

Create `src/lib/db.ts`:

```typescript
import { Kysely } from 'kysely';
import { TauriSqliteDialect } from '@/lib/db-dialect'; // You'll need to implement this for Tauri
import { Database } from '@/types/db';

export const db = new Kysely<Database>({
  dialect: new TauriSqliteDialect({
    path: 'restaurant.db',
  }),
});
```

Create `src/types/db.ts`:

```typescript
import { Generated } from 'kysely';

export interface IngredientTable {
  id: Generated<number>;
  name: string;
  category: string;
  unit_of_measure: string;
  current_price: number;
  price_per_unit: number;
  current_stock: number | null;
  min_stock_level: number | null;
  supplier_id: number | null;
  notes: string | null;
  last_updated: string | null;
}

export interface Database {
  ingredients: IngredientTable;
  // Add other tables here
}
```

### Step 11: Create Environment Files

Create `.env.example`:

```env
# Database
DATABASE_PATH=./restaurant.db

# App Configuration
VITE_APP_NAME=RestaurantManage
VITE_APP_VERSION=1.0.0
```

Create `.env` (copy from .env.example):
```bash
cp .env.example .env
```

### Step 12: Update .gitignore

Ensure `.gitignore` includes:

```gitignore
# Dependencies
node_modules/
bun.lock*

# Build outputs
dist/
dist-ssr/
*.local

# Database
*.db
*.db-shm
*.db-wal

# Environment
.env
.env.local

# Tauri
src-tauri/target/

# IDEs
.vscode/*
!.vscode/extensions.json
.idea/
*.sublime-*

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### Step 13: Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "tauri:dev": "tauri dev",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Step 14: Create Initial Components

Install Shadcn/UI to get the base components:

```bash
# Initialize Shadcn (if not already done)
bun x shadcn@latest init

# Add Button component
bun x shadcn@latest add button
```

This will create `src/components/ui/button.tsx`. You can then use this button directly or wrap it in `src/components/atoms` if functionality extension is needed.

**Example of wrapping Shadcn Button in `src/components/atoms/Button.tsx`:**

```typescript
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ShadcnButtonProps {
  isLoading?: boolean;
}

export function Button({ isLoading, className, children, ...props }: ButtonProps) {
  return (
    <ShadcnButton 
      disabled={isLoading || props.disabled} 
      className={cn(className)} 
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </ShadcnButton>
  );
}
```

**`src/components/atoms/Button/index.ts`:**
```typescript
export { Button } from './Button';
```

### Step 15: Verify Installation

Run these commands to verify everything is set up correctly:

```bash
# Check TypeScript compilation
bun run type-check

# Check linting
bun run lint

# Generate database migrations
bun run db:generate

# Start dev server
bun run dev
```

## Post-Setup Checklist

After completing the setup, verify:

- [ ] Tauri app launches without errors
- [ ] Hot reload works when editing React components
- [ ] TypeScript strict mode is enabled and passing
- [ ] Biome linting runs without errors
- [ ] Lefthook pre-commit hooks are installed
- [ ] Database schema is generated successfully
- [ ] Path aliases (`@/*`) work correctly
- [ ] Design tokens are available in components
- [ ] Atomic Design folder structure is in place

## Troubleshooting

### Common Issues

**1. "Cannot find module '@/*' " errors:**
```bash
# Restart TypeScript server in VS Code
# Or specify paths in both tsconfig.json AND vite.config.ts
```

**2. Tauri build prerequisites missing:**
```bash
# Windows: Install Visual Studio C++ Build Tools
# Verify Rust: rustc --version
```

**3. Drizzle migration errors:**
```bash
# Ensure drizzle.config.ts path is correct
# Check that schema.ts doesn't have syntax errors
```

## Next Steps

After setup is complete:
1. Read `docs/plan/PROJECT_PLAN.md` for feature roadmap
2. Read `.agent/RULES.md` for coding standards
3. Start implementing features following Atomic Design
4. Write tests as you build features

## References

- [Tauri Documentation](https://tauri.app/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Biome](https://biomejs.dev/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
- RestaurantManage PROJECT_PLAN.md
- RestaurantManage RULES.md
