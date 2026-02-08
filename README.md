# Gusto - Restaurant Manager

[![GitHub Release](https://img.shields.io/github/v/release/serguei9090/Gusto?style=flat-square&color=blue)](https://github.com/serguei9090/Gusto/releases)
[![CI Status](https://img.shields.io/github/actions/workflow/status/serguei9090/Gusto/ci.yml?branch=main&style=flat-square)](https://github.com/serguei9090/Gusto/actions/workflows/ci.yml)

A premium desktop application for restaurant recipe costing, inventory management, and food cost analysis.

## Features

- **Recipe Costing**: Real-time calculation of dish costs, profit margins, and suggested pricing.
- **Inventory Tracking**: Manage stock levels with weighted average cost (WAC) tracking.
- **Prep Sheets**: Aggregate ingredient needs across multiple recipes for efficient preparation.
- **Multi-Currency Support**: Handle ingredient pricing in different currencies (USD, EUR, CUP).
- **Offline First**: All data is stored locally on your machine for privacy and speed.

## Tech Stack

- **Framework**: [Tauri 2.x](https://tauri.app/) (Rust backend + Web frontend)
- **Frontend**: React 19 + TypeScript + Framer Motion
- **Build Tool**: Vite + Bun
- **Database**: SQLite (via Tauri SQL Plugin) + Kysely
- **Styling**: Tailwind CSS 4.0
- **Quality**: Biome (Linting/Formatting) + Vitest + Playwright

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Rust](https://www.rust-lang.org/) (for Tauri)
- Windows 10/11

## Setup & Development

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start development**:
   ```bash
   bun run tauri:dev  # Launch desktop app with hot-reload
   ```

## Workflow & Quality

Before pushing changes, ensure all checks pass:
```bash
bun run lint        # Code quality check
bun run type-check  # TypeScript validation
bun run test:unit   # Unit tests
```

---

## Releases

To download the latest stable version, visit the [Releases Page](https://github.com/serguei9090/Gusto/releases).

**Note**: This is a standalone Windows application. Download the `.msi` or `.exe` installer from the assets section of the latest release.

## License

Private - All Rights Reserved © 2026
