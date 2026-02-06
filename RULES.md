# RestaurantManage Project Rules

This document outlines mandatory coding standards to ensure code quality, type safety, and consistency across the project. All developers (AI and human) MUST follow these rules.

## Mandatory: Pre-Coding Consultation
**Before writing ANY code**, you MUST consult the `code-quality-consultant` skill. This ensures that the code you produce adheres to the latest standards and avoids the specific pitfalls identified in previous sprints (e.g., `any` types, missing dependencies, incorrect selector types).

## 1. Type Safety
- **No `any` usage**: Avoid the `any` type at all costs. Use `unknown` or specific interfaces.
  - If `any` is strictly required for library interop, use a Biome suppression: `// biome-ignore lint/suspicious/noExplicitAny: <reason>`
- **Strict Database Typing**: When using `better-sqlite3` or similar libraries, cast query results to specific interfaces.
  - GOOD: `db.get(id) as { name: string }`
  - BAD: `db.get(id) as any`
- **Exhaustive Dependencies**: Always include all used variables in `useEffect`, `useCallback`, and `useMemo` dependency arrays.

## 2. E2E Testing (Playwright)
- **Typed Fixtures**: Ensure all fixtures are properly typed. Avoid using `any` in test arguments.
- **No Unused Parameters**: If a fixture (like `database`) is declared in a test but not used, remove it to satisfy Biome rules.
- **Selector Stability**: Use string labels for `selectOption` (e.g., `{ label: "Option Name" }`) instead of RegExp patterns to ensure type compatibility with Playwright.
- **Zero Fractions**: Do not use zero fractions in numeric expectations.
  - GOOD: `expect(value).toBe(12)`
  - BAD: `expect(value).toBe(12.0)`

## 3. General Best Practices
- **Global Objects**: Prefer `globalThis` over `window` for cross-environment compatibility.
- **Modern JS APIs**: Use `Number.parseFloat` / `Number.isNaN` / `Number.isFinite` instead of their global counterparts.
- **ESNext Features**: Use `String.replaceAll` instead of `String.replace` for global replacements.
- **Unused Directives**: Regularly clean up `@ts-ignore` or `@ts-expect-error` comments that are no longer needed.

## 4. Linting & Formatting
- **Standard**: Biome is the primary tool for linting and formatting.
- **Indentation**: Use **2 spaces** for indentation. NEVER use tabs.
- **Spaces in Braces `{}`**: ALWAYS include a single space inside curly braces for object literals and destructuring.
  - GOOD: `{ name: string }`, `const { t } = useTranslation();`
  - BAD: `{name: string}`, `const {t} = useTranslation();`
- **Spaces in Parens `()` and Brackets `[]`**: DO NOT include spaces inside parentheses or square brackets unless they contain multiline content.
  - GOOD: `expect(value).toBe(12)`, `const arr = [1, 2, 3];`
  - BAD: `expect( value ).toBe( 12 )`, `const arr = [ 1, 2, 3 ];`
- **Pre-commit**: Lefthook is used to enforce these rules at commit time. Always run `bun run lint` before submitting changes.
