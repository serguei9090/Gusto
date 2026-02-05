# Technology Stack Rules

**Project:** Restaurant Recipe Costing & Inventory Management

---

## 🎯 Technology Stack Enforcement

### MUST USE:
- **Desktop Framework:** Tauri 2.x (NOT Electron)
- **Frontend:** React 19+ with TypeScript (strict mode)
- **Package Manager:** Bun (NOT npm/yarn/pnpm)
- **Database:** SQLite via `@tauri-apps/plugin-sql` (NO ORM)
- **State Management:** Zustand (lightweight, simple)
- **Styling:** CSS Modules + CSS Variables (NO Tailwind, NO styled-components)
- **Animation:** Framer Motion
- **Validation:** Zod
- **Testing:** Vitest (unit), Playwright (E2E)
- **Quality:** Biome (linting/formatting), Lefthook (git hooks)

### NEVER USE:
- ❌ Electron (use Tauri instead)
- ❌ npm/yarn/pnpm (use Bun)
- ❌ Redux/MobX (use Zustand)
- ❌ Tailwind CSS (use CSS Modules)
- ❌ Any CSS-in-JS libraries
- ❌ Class components (functional components only)

---

**Last Updated:** 2026-02-04
