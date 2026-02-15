---
trigger: manual
---

# Development Setup & Commands

---

## 🔧 Development Environment Setup

### Required Tools
- [Bun](https://bun.sh/) (latest version)
- [Rust](https://www.rust-lang.org/) (for Tauri)
- Windows 10/11
- VS Code (recommended)

### Quick Command Reference

```bash
# Development
bun run dev          # Start Tauri app with hot reload
bun run type-check   # TypeScript validation
bun run lint         # Check code quality
bun run lint:fix     # Auto-fix issues
bun run format       # Format code with Biome
bun test             # Run unit tests
bun test:watch       # Watch mode for tests

# Database
bun run db:generate  # Generate Drizzle migrations
bun run db:push      # Apply migrations to database
bun run db:studio    # Open Drizzle Studio (database GUI)

# Build
bun run build        # Production build
```

### VS Code Settings (Recommended)

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "css"
  }
}
```

### VS Code Extensions

Recommended extensions:
- Biome (biomejs.biome)
- Tauri (tauri-apps.tauri-vscode)
- TypeScript (built-in)

---

**Last Updated:** 2026-02-04
