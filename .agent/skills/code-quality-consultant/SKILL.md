---
name: code-quality-consultant
description: Consult this skill before writing code to ensure compliance with the RestaurantManage project quality standards. It provides automated checklists for type safety, E2E testing, and general best practices to prevent common linting and runtime errors.
---

# Code Quality Consultant

Use this skill to verify your code against project standards BEFORE submitting changes.

## Quality Checklist

### 1. Type Safety
- [ ] NO `any` usage. Use `unknown` or interfaces.
- [ ] Database results are explicitly cast (e.g., `as { id: number }`).
- [ ] `biome-ignore` comments are used ONLY when strictly necessary with a valid reason.

### 2. React Best Practices
- [ ] `useEffect`, `useMemo`, `useCallback` have exhaustive dependencies.
- [ ] Use `globalThis` instead of `window`.
- [ ] Numeric logic uses `Number.isFinite` or `Number.isNaN`.

### 3. E2E Testing (Playwright)
- [ ] All test parameters (fixtures) are used.
- [ ] `selectOption` uses string labels: `selectOption({ label: "Exact Name" })`.
- [ ] Numeric expectations do not use zero fractions (e.g., `toBe(5)`, not `toBe(5.0)`).
- [ ] No `any` in test code.

### 4. Code Style & Formatting
- [ ] Indentation uses **2 spaces** (no tabs).
- [ ] Spaces INSIDE braces `{ }` (e.g., `{ id: 1 }`).
- [ ] NO spaces inside parens `( )` or brackets `[ ]` (e.g., `func(arg)`, `[1, 2]`).
- [ ] No leftover `console.log` (use the `logger` utility).
- [ ] Unused `@ts-expect-error` or `@ts-ignore` are removed.
- [ ] Strings use `replaceAll` for global replacements.

## Reference Material
- See [RULES.md](../../../RULES.md) for the full source of truth.
- Run `bun run lint` to verify locally.
