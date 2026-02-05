# RestaurantManage

A standalone Windows desktop application for restaurant recipe costing and inventory management.

## Tech Stack

- **Desktop Framework**: Tauri 2.x
- **Frontend**: React 19 + TypeScript (strict mode)
- **Animation**: Framer Motion
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Database**: SQLite with Drizzle ORM
- **State Management**: Zustand
- **Styling**: CSS Modules + CSS Variables
- **Linting/Formatting**: Biome
- **Git Hooks**: Lefthook
- **Testing**: Vitest + Playwright

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Rust](https://www.rust-lang.org/) (for Tauri)
- Windows 10/11

##  Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

3. **Initialize database** (after creating schema):
   ```bash
   bun run db:generate
   bun run db:push
   ```

## Development

```bash
# Start development server (hot reload)
bun run dev

# Type checking
bun run type-check

# Linting
bun run lint
bun run lint:fix

# Format code
bun run format
```

## Database Management

```bash
# Generate Drizzle migrations
bun run db:generate

# Apply migrations
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Build

```bash
# Build production bundle
bun run build
```

## Project Structure

```
src/
├── components/          # Atomic Design components
│   ├── atoms/          # Basic elements
│   ├── molecules/      # Component combinations
│   ├── organisms/      # Complex sections
│   ├── templates/      # Page layouts
│   └── pages/          # Complete pages
├── services/           # Business logic & data access
│   └── database/       # Drizzle schemas
├── store/              # Zustand stores
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript types
└── styles/             # Global styles & design tokens
```

## Documentation

- **Project Plan**: `docs/plan/PROJECT_PLAN.md`
- **Rules**: `.agent/rules/*.md`
- **Skills**: `.agent/skills/*/SKILL.md`

## License

Private - All Rights Reserved
