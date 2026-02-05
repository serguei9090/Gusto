# RestaurantManage - Setup Summary

**Created:** 2026-02-04  
**Status:** ✅ Planning & Rules Configuration Complete

---

## 📚 Documentation Created

### 1. **Project Plan** (`docs/plan/PROJECT_PLAN.md`)

Comprehensive planning document covering:
- ✅ Technology stack (Tauri, React 19, TypeScript, Bun, SQLite, Tauri SQL Plugin)
- ✅ Complete project structure (Atomic Design pattern)
- ✅ Database schema (6 core tables with relationships)
- ✅ All 5 MVP features with user stories
- ✅ Design system (colors, typography, spacing tokens)
- ✅ 6-week implementation roadmap
- ✅ Quality standards and testing requirements
- ✅ Business logic patterns and formulas

### 2. **Project Rules** (`.agent/rules/*.md`)

Antigravity-specific rules segmented for better maintainability and token efficiency:
- **`tech-stack.md`**: Enforces Tauri 2.x, React 19+, Bun, and Tauri SQL Plugin.
- **`architecture.md`**: Mandates **Atomic Design** and preserves `.agent`/`.agents` folders.
- **`typescript.md`**: Strict mode standards and **Zod** validation.
- **`database.md`**: SQL Plugin usage and service layer access patterns.
- **`logic.md`**: Recipe costing and food percentage formulas.
- **`styling.md`**: CSS Modules, design tokens, and **Framer Motion**.
- **`testing.md`**: Vitest and Playwright requirements.
- **`workflow.md`**: Git conventions and PR requirements.
- **`best-practices.md`**: Critical DOs and DON'Ts.
- **`code-review.md`**: Comprehensive checklist for feature completion.
- **`setup.md`**: Dev environment commands and VS Code settings.

---

## 🛠️ AI Skills Installed

### Master Repository (`.agents/skills/`)
Independent copies of global/official skills:
- **`requesting-code-review`**: How to request effective code reviews.
- **`receiving-code-review`**: How to respond to code review feedback.
- **`mcp-builder`**: Guide for creating MCP servers.
- **`skill-creator`**: Guide for creating new custom skills.

### Project Repository (`.agent/skills/`)
Project-specific skills and links to active masters:
- **`tauri-setup`**: Step-by-step Tauri + React 19 + Bun initialization.
- **`recipe-costing`**: Restaurant business logic implementation patterns.
- **`sync-docs`**: Tool for maintaining documentation consistency.
- **Links**: Active symlinks to the code review and builder skills in `.agents/`.

---

## 🎯 Technology Stack Summary

| Category | Technology | Why |
|----------|------------|-----|
| **Desktop Framework** | Tauri 2.x | 10x smaller than Electron, better security |
| **Frontend** | React 19 + TypeScript | Industry standard, latest stable features |
| **Animation** | Framer Motion | Smooth, premium micro-animations |
| **Build Tool** | Vite | Fast HMR, optimized builds |
| **Package Manager** | Bun | Fast, aligns with user standards |
| **Database** | SQLite | Local-first, zero config, ACID compliant |
| **Access Layer** | Tauri SQL Plugin | Native desktop integration, no Node APIs |
| **State Management** | Zustand | Simple, minimal boilerplate |
| **Styling** | CSS Modules + Variables | No runtime, full control |
| **Linting/Formatting** | Biome | Fast, all-in-one tool |
| **Git Hooks** | Lefthook | Enforces quality before commits |
| **Testing** | Vitest + Playwright | Fast, modern testing stack |

---

## 📂 Project Structure

```
RestaurantManage/
├── .agent/
│   ├── rules/                        ← Segmented project rules
│   ├── skills/                       ← Active project skills
│   └── workflows/                    ← Automation (e.g., /init-project)
│
├── .agents/                          ← Mandatory master skills folder
│   └── skills/                       ← Independent skill copies
│
├── docs/
│   └── plan/
│       └── PROJECT_PLAN.md           ← Master reference document
│
├── src/                              ← Frontend source (Atomic Design)
│   ├── components/
│   │   ├── atoms/                    ← Button, Input, Label, Icon
│   │   ├── molecules/                ← FormField, SearchBar, Card
│   │   ├── organisms/                ← RecipeForm, InventoryTable
│   │   ├── templates/                ← MainLayout, DashboardLayout
│   │   └── pages/                    ← Dashboard, Recipes, Inventory
│   ├── services/
│   │   ├── database/
│   │   │   └── client.ts             ← SQL Plugin client & schema
│   │   ├── recipes.service.ts
│   │   └── inventory.service.ts
│   ├── store/                        ← Zustand stores
│   ├── hooks/                        ← Custom React hooks
│   ├── utils/                        ← Utilities, formatters
│   ├── types/                        ← TypeScript types
│   └── styles/
│       └── index.css                 ← Design system tokens
│
├── src-tauri/                        ← Rust backend (Simplified)
├── tests/                            ← Test suites
├── lefthook.yml                      ← Git hooks config
├── biome.json                        ← Linting config
└── package.json
```

---

## 🗄️ Database Schema Overview

**6 Core Tables:**

1. **ingredients** - Stores all ingredients with pricing and stock
2. **suppliers** - Supplier contact and payment information
3. **recipes** - Recipe metadata, servings, pricing
4. **recipe_ingredients** - Junction table linking recipes to ingredients
5. **inventory_transactions** - Audit trail for all stock movements
6. **price_history** - Historical pricing for trend analysis

---

## 🎨 Design System Highlights

**Color Palette:**
- Primary: Green (#22c55e) - Professional restaurant theme
- Neutrals: Clean grays for text and backgrounds
- Semantic: Success, Warning, Error, Info

**Animation:**
- **Framer Motion**: Standard for all transitions and micro-interactions.

---

## 🚀 Next Steps (Implementation Phase)

### Week 1: Foundation
1. ✅ run **`/init-project`** workflow to scaffold directories.
2. ✅ Follow **`tauri-setup`** skill to initialize app.
3. ✅ Create design system CSS and core atoms.

---

## 📋 Quick Reference Commands

```bash
# Development
bun run tauri:dev              # Start Tauri app (Backend + Frontend)
bun run dev                    # Start Frontend only (Browser mode)

# Quality
bun run lint                   # Check code quality
bun run type-check             # TypeScript validation
```

---

## 🎓 Key Principles (from `.agent/rules/`)

**ALWAYS:**
- ✅ Keep `.agent` and `.agents` folders (Mandatory Identity).
- ✅ Use Atomic Design hierarchy.
- ✅ Use React 19 and Framer Motion for UI.
- ✅ Validate inputs with Zod schemas.
- ✅ Keep business logic in service layer.
- ✅ Write tests for business logic (>80% coverage).

**NEVER:**
- ❌ Delete agent metadata folders.
- ❌ Use Electron or npm/yarn.
- ❌ Hardcode colors/spacing (use tokens).
- ❌ Query database from components.

---

**Status:** 🟢 Ready for implementation  
**Next Action:** Run the `/init-project` workflow.

---

**Document Version:** 1.2  
**Last Updated:** 2026-02-04

> [!IMPORTANT]
> **Tauri SQL Permissions**: You must explicitly allow SQL commands in `src-tauri/capabilities/default.json`. 
> Required permissions: `sql:allow-load`, `sql:allow-execute`, `sql:allow-select`.
