# Development Workflow Rules

---

## 🔄 Development Workflow

### Git Commit Conventions

**MUST use Conventional Commits:**
```
feat: add ingredient price history tracking
fix: correct recipe cost calculation rounding
docs: update README with setup instructions
style: format code with Biome
refactor: extract cost calculation to service
test: add unit tests for inventory service
chore: update dependencies
```

### Pull Request Requirements

Before merging:
- [ ] All tests pass (`bun test`)
- [ ] Type check passes (`bun run type-check`)
- [ ] Linting passes (`bun run lint`)
- [ ] Code reviewed by at least one person
- [ ] Database migrations tested
- [ ] No console errors in dev mode

### Development Commands

```bash
# Development
bun run dev          # Start Tauri app with hot reload
bun run type-check   # TypeScript validation
bun run lint         # Check code quality
bun run lint:fix     # Auto-fix issues



# Build
bun run build        # Production build
```

---

**Last Updated:** 2026-02-04
