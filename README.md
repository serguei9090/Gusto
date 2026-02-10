# Gusto - Restaurant Manager

[![GitHub Release](https://img.shields.io/github/v/release/serguei9090/Gusto?style=flat-square&color=blue)](https://github.com/serguei9090/Gusto/releases)
[![CI Status](https://img.shields.io/github/actions/workflow/status/serguei9090/Gusto/ci.yml?branch=main&style=flat-square)](https://github.com/serguei9090/Gusto/actions/workflows/ci.yml)

Gusto is a premium, offline-first desktop application designed for professional chefs and restaurant managers. It provides a robust suite of tools for recipe costing, inventory management, and food cost analysis, built with a modern **"Open Core"** architecture.

---

## 🏗 Modular Architecture ("Open Core")

Gusto follows a modular design pattern that separates essential community features from professional extensions. This allows for a clean, extensible codebase where functionality can be "slotted" in without modifying the core logic.

### 🛡 Core Modules (Open Source)
The backbone of the application. These features are fully open-source and offline-first:
- **Dashboard**: Financial health overview and urgent alerts.
- **Ingredients**: Stock management, price tracking, and unit conversions.
- **Recipes**: Dynamic costing, sub-recipe nesting, and version history.
- **Inventory**: Transactional stock tracking with WAC (Weighted Average Cost).
- **Suppliers**: Comprehensive supplier directory and contact management.
- **Prep Sheets**: Production planning and ingredient requirements.

### 💎 Pro Extensions (Private / Closed Source)
**Status: 🚧 Under Construction**

Advanced professional features are developed as pluggable, **closed-source extensions**. These modules are designed for enterprise needs and high-efficiency operations.
- **Pluggable Architecture**: Built to be added or removed without touching core files.
- **Custom Development**: The architecture supports bespoke extensions tailored to specific restaurant workflows (e.g., custom POS integrations, enterprise reporting, or cloud synchronization).
- **Managed Deployment**: Pro features are delivered as private modules for commercial use.

---

## 🧪 The "Slot Pattern"

Extensibility is baked into the core. Modules register themselves into specific "slots" using centralized registries, ensuring zero-footprint integration:

```typescript
// Example: A module injecting a widget into the Core Dashboard
dashboardRegistry.register({
  id: "custom-extension-widget",
  component: CustomWidget,
  order: 45
});
```

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (latest version)
- [Rust Toolchain](https://www.rust-lang.org/) (for Tauri builds)
- Windows 10/11

### Setup & Development
1. **Repository Setup**:
   ```bash
   bun install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   - `VITE_APP_MODE`: Set to `pro` to enable the professional extension sandbox (includes a demo module).
   - `VITE_DB_MODE`: Switch between `local` (SQLite) and `remote` databases.

3. **Run Application**:
   ```bash
   bun run tauri:dev  # Launch desktop app with hot-reload
   ```

---

## 💻 Tech Stack
- **Desktop Runtime**: [Tauri 2.x](https://tauri.app/) (Rust + Webview)
- **Frontend**: React 19 + TypeScript + Framer Motion
- **Build Tool**: Vite + Bun
- **Database**: SQLite via Tauri SQL Plugin + Kysely
- **Styling**: Tailwind CSS 4.0 + Shadcn/UI

---

## 🛠 Workflow & Quality

Before pushing changes, ensure all checks pass:
```bash
bun run lint        # Code quality check (Biome)
bun run type-check  # TypeScript validation
bun run test:unit   # Unit tests
bun run test:e2e    # E2E tests (Playwright)
```

## 📖 Documentation
Detailed technical guides, database schemas, and architectural decisions can be found in the [Project Wiki](./docs/WIKI.md).

## 📄 License
Core: MIT / Private (Check LICENSE file) - All Rights Reserved © 2026
