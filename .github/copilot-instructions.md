# Project Guidelines for AI coding agents

These concise instructions orient an AI coding agent to this repository's structure, patterns, and common workflows. Follow only discoverable, concrete conventions present in the codebase.

## Code Style
- Primary language: TypeScript + React. Formatter/linter: Biome (see `biome.json`).
- Use the repo scripts: `npm run format` / `npm run lint` / `npm run type-check` (see `package.json`).
- Follow existing patterns in `src/` and module READMEs: [src/modules/core/README.md](src/modules/core/README.md) and [src/modules/pro/README.md](src/modules/pro/README.md).

## Architecture
- Web UI lives in `src/` (Vite + React). Native shell and build artifacts live under `src-tauri/`.
- Feature/module boundary: `src/modules/*` (core vs pro vs mobile). Use `VITE_APP_MODE` to select app variants (see scripts `tauri:dev`, `tauri:dev:pro`, `build:pro` in `package.json`).
- Services and DB-related code live under `src/services/` and `drizzle/`.

## Build and Test (commands agents can run)
- Install: `npm install` (or use project's preferred node runtime if specified locally).
- Dev web: `npm run dev`
- Dev Tauri (core): `npm run tauri:dev`
- Build web: `npm run build`
- Unit tests: `npm run test:unit` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)
- Lint/format/type-check: `npm run lint`, `npm run format`, `npm run type-check`

Agents should prefer the npm scripts above rather than directly invoking underlying tools unless a specific script is missing.

## Project Conventions
- Module selection by environment variable: `VITE_APP_MODE` drives differences between `core`, `pro`, and `mobile` builds.
- Migration and DB work: check `drizzle/` and `scripts/db-migrate.ts` for schema and migration responsibilities.
- Tests: e2e fixtures and tests live in `e2e/` and `tests/e2e/`; follow existing fixtures when creating new end-to-end flows.
- Formatting/linting: use Biome as configured; do not introduce a second formatter.
- Pre-commit hooks: see `lefthook.yml` for repository hooks and expectations.

## Integration Points
- Tauri native integration: `src-tauri/` and `tauri.conf.json` control native behavior. Use `@tauri-apps/*` APIs and plugins declared in `package.json`.
- Local DB: Kysely + better-sqlite3 and Tauri SQL plugin. Inspect `src/services/database` and `drizzle/` for patterns.
- E2E automation: Playwright (`playwright.config.ts`) with fixtures in `e2e/fixtures`.

## Security and Sensitive Areas
- Do not commit secrets or local device keys. Check `src-tauri/` and any native build configs for platform-specific credentials.
- Database migrations and seed data live in `drizzle/` and `e2e/fixtures/seed-data.ts` — treat migration files as high-risk and avoid destructive changes without explicit review.

## When Editing This File
- Keep guidance short and fact-based. Link to concrete files or configs rather than general rules.

If anything above is incomplete or unclear, please reply with specific gaps (e.g., preferred package manager, CI steps, or additional module docs) so I can iterate.
