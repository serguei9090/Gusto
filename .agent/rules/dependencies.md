# Dependency Management Rules

---

## 📦 Dependency Management

### Adding Dependencies

**Before adding any package, ASK:**
1. Is this really needed, or can we build it in ~1 hour?
2. Is it actively maintained (last update < 6 months)?
3. Is it compatible with our stack (Bun, Tauri, React 19)?
4. Does it have TypeScript types?

**Approved Dependencies:**
- UI: `framer-motion`
- Forms: `react-hook-form` (if needed)
- Dates: `date-fns`
- Charts: `recharts` (for reports)
- Icons: `lucide-react`

**DO NOT add without discussion:**
- Any state management library (we use Zustand)
- Any CSS framework (we use CSS Modules)
- Any database library (we use Drizzle ORM)

**Current Stack:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tauri-apps/api": "^2.0.0",
    "zustand": "^5.0.0",
    "zod": "^4.0.0",
    "framer-motion": "^12.0.0",
    "drizzle-orm": "^0.45.0",
    "better-sqlite3": "^12.0.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@biomejs/biome": "^2.0.0",
    "drizzle-kit": "^0.31.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "latest"
  }
}
```

---

**Last Updated:** 2026-02-04
