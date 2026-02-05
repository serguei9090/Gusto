---
description: Initialize the RestaurantManage project with Tauri, React, and Bun
---

# Project Initialization Workflow

This workflow automates the first few steps of the `tauri-setup` skill to get the project structure ready.

// turbo
1. Initialize the project directory structure
```powershell
New-Item -ItemType Directory -Path "src/components/atoms", "src/components/molecules", "src/components/organisms", "src/components/templates", "src/components/pages", "src/store", "src/hooks", "src/services/database", "src/services", "src/utils", "src/types", "src/assets/icons", "src/assets/images", "src/assets/fonts", "src/styles" -Force
```

2. Follow the detailed steps in `.agent/skills/tauri-setup/SKILL.md` to run `bun create tauri-app` and install dependencies.

3. Verify the setup by running:
```powershell
bun run type-check
```
