# Gusto Mobile (Android) Strategy: Pro Extension Model

## Overview
This document outlines the architectural strategy to keep the **Gusto Core** repository focused on desktop/web while isolating full Android APK capabilities and deep mobile-first optimizations within the **Gusto Pro** private repository.

## 1. Modular Mobile Architecture
The goal is to avoid "polluting" the core codebase with logic that is only relevant for the mobile application.

### A. UI Responsibility Split
- **Core Repository**: Standard responsive design (web standards). Works on small browsers but is optimized for desktop interactions. It should NOT contain "Native-only" buttons or layout hacks.
- **Pro Repository**: "Mobile Adapters." These are specialized versions of core pages/components that are injected into the app ONLY when running in the APK environment.

### B. The Slot System for UI Injection
We will use the existing `SlotRegistry` to allow the Pro module to "overwrite" core views with mobile-optimized versions.

**Example Pattern:**
1. Core defines a slot: `<Slot name="inventory.page" defaultComponent={DesktopInventory} />`
2. Pro detects a mobile environment and registers: `registry.registerSlot("inventory.page", MobileInventory)`

### C. Mobile-Only HUD (Heads-Up Display)
Instead of adding a "Close" button to every core form, the Pro module registers a `MobileShell` that wraps every `DialogContent` or `Modal` when `isMobile` is true. This shell provides the consistent "Close" footer globally without editing core files.

## 2. Project Structure Adjustment

To isolate the Android build, we move the Tauri mobile configuration and native assets to the pro layer:

```text
/Gusto
├── src/
│   └── modules/
│       ├── core/       # Desktop-first core logic
│       └── pro/        # Private extensions
│           └── mobile/ # MOBILE SOURCE OF TRUTH
│               ├── app/        # Mobile-only components
│               ├── hooks/      # Mobile-specific native hooks
│               ├── styles/     # mobile-native.css (moved from core index.css)
│               └── src-tauri/  # Mobile APK configuration (Android/iOS)
```

## 3. Implementation Workflow

### Step 1: Extract Mobile CSS
Move mobile-specific "native-feel" CSS from `src/index.css` to `src/modules/pro/mobile/styles/mobile-native.css`. In `core/App.tsx`, we only import this file if the `pro` module is present and we are in a mobile context.

### Step 2: Global Mobile Wrapper
Instead of manual "Close" buttons in Core, create a `MobileFormWrapper` in `pro`.
Use the `mobileRegistry` to inject this wrapper around core forms.

### Step 3: Tauri Multi-Environment Config
Use a custom `tauri.conf.mobile.json` inside the `pro` directory. The build script for the APK will point Tauri to this specific config file located in the private repo.

## 4. Build Strategy (The APK)
The command to build the Android app will reside in the Pro repository:

- **Desktop (Core)**: `bun tauri build` (Uses root `src-tauri`)
- **Android (Pro)**: `bun pro:mobile:build` -> `tauri build --config ./src/modules/pro/mobile/src-tauri/tauri.conf.json`

## 5. Benefits of This Approach
1. **Clean Core**: The public/core repo stays lightweight and focuses on the high-performance desktop experience.
2. **Monetization/Privatization**: Mobile convenience (APK) is preserved as a Pro feature.
3. **Optimized Performance**: We don't load heavy mobile-specific libraries or CSS in the desktop app.

## Summary of Action Items
1. Create `src/modules/pro/mobile/styles`.
2. Extract mobile-only CSS from `src/index.css`.
3. Create a `MobileShell` component in `pro` that injects the "Close" buttons via `SlotRegistry`.
4. Move Android build configs to the Pro directory.
