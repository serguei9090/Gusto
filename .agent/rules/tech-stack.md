---
trigger: always_on
---

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
- **Styling:** Tailwind CSS + Shadcn UI (Class-based utilities)
- **Animation:** Framer Motion
- **Validation:** Zod
- **Testing:** Vitest (unit), Playwright (E2E)
- **Quality:** Biome (linting/formatting), Lefthook (git hooks)

### NEVER USE:
- ❌ Electron (use Tauri instead)
- ❌ npm/yarn/pnpm (use Bun)
- ❌ Redux/MobX (use Zustand)
- ❌ CSS Modules / Stylesheets (except global index.css)
- ❌ Styled-Components / Emotion (Runtime CSS-in-JS is BANNED)
- ❌ Class components (functional components only)

---

**Last Updated:** 2026-02-15
