---
name: workflow-guide
description: Identify the correct skill for each user task. Use this skill when unsure which skill (e.g., tauri-setup, module-builder) to apply for a specialized task.
---

# Workflow Guide Skill

This skill helps you select the appropriate skill based on the nature of the user's request.

## Skill Selection Matrix

| User Intent | Recommended Skill | When to Use |
| :--- | :--- | :--- |
| **Initialize Project** | `tauri-setup` | Creating a new app from scratch (Tauri + React + Bun). |
| **New Feature / Module** | `module-builder` | Adding a new functional module (e.g., Inventory, Staff) or widget. |
| **Code Review / QA** | `code-quality-consultant` | Checking code against project standards (Biome, TS, E2E). |
| **Refactoring** | `modular-refactoring` | Splitting monolithic code into modules (Core vs. Pro). |
| **Documentation** | `sync-docs` | Updating documentation to match code changes. |
| **Understanding Processes** | `recipe-costing` | Understanding the domain logic for costing/profit. |

## Detailed Guidelines

### 1. Starting Fresh (`tauri-setup`)
Use when the user says:
- "Create a new app"
- "Setup the project"
- "Initialize the repository"

Follow the `tauri-setup` skill to create the base structure, configure `bun`, `drizzle`, `biome`, and atomic design folders.

### 2. Building Features (`module-builder`)
Use when the user says:
- "Add an Inventory module"
- "Create a new widget"
- "Implement a feature for managing staff"

Follow the `module-builder` skill to create the directory structure in `src/modules`, configure atomic components, and register the module.

### 3. Checking Quality (`code-quality-consultant`)
Use when the user says:
- "Review my code"
- "Fix lint errors"
- "Is this code okay?"

Use the `code-quality-consultant` checklist to verify type safety, React best practices, and formatting compliance.

### 4. Refactoring (`modular-refactoring`)
Use when the user says:
- "Move this feature to a plugin"
- "Make the sidebar dynamic"
- "Extract core functionality"

Follow the `modular-refactoring` skill to separate concerns and ensure clean module interfaces.
