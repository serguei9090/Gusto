# PROMPT: Refactor to Mobile-First Open Core Architecture

**Context:**
We are transforming the **Gusto** application to follow a "Mobile-First Open Core" architecture. Currently, we have a separate `src/modules/pro/mobile` folder that duplicates UI logic for mobile devices. We want to eliminate this duplication and build a **Single Responsive Codebase** that works seamlessly on both Mobile (APK via Tauri) and Desktop without relying on complex `if (isMobile)` conditional rendering.

**Objective:**
Refactor the codebase to implement a "One Config" UI strategy where the Core and Pro modules are inherently mobile-responsive by default.

**Key Requirements:**

1.  **Eliminate `src/modules/pro/mobile`**:
    *   Merge unique mobile features from `src/modules/pro/mobile` into their respective feature modules in `src/modules/core` or `src/modules/pro`.
    *   Delete the dedicated `mobile` folder once functionality is preserved.

2.  **Adopt "Mobile-First" UI Patterns**:
    *   **Lists**: Convert all data tables to **Card Layouts** by default.
        *   *Mobile*: Single column stack of cards.
        *   *Desktop*: Responsive Grid (2-3-4 columns) or Tables (only where strictly necessary for dense data).
    *   **Navigation**: Ensure the primary navigation works responsively (Sidebar on Desktop, Bottom/Hamburger on Mobile) without duplicating the route definition.
    *   **Forms**: Style forms to be touch-friendly (48px+ touch targets) on all devices.

3.  **CSS-Driven Responsiveness (No JS Logic)**:
    *   Remove `if (isMobile)` checks in JSX where CSS Media Queries (Tailwind `md:`, `lg:`) can solve the layout difference.
    *   Use CSS variables and utility classes (e.g., `pb-safe`, `pt-safe`, `safe-area-inset-*`) to handle notches and home indicators dynamically.

4.  **Architecture & Maintainability**:
    *   **Open Core**: Ensure Core features (`ingredients`, `recipes`, etc.) provide the "Shell" and "Layout" that Pro features can simply plug into.
    *   **Pro Extensions**: Pro features should inject themselves into the Core layout without needing a separate "Mobile View".
    *   **Performance**: Minimize React re-renders caused by screen resizing or device type detection.

**Implementation Plan:**

1.  **Analyze**: Review `src/modules/pro/mobile` to identify unique mobile features that need to be ported.
2.  **Refactor Core**: Start with a core module (e.g., `ingredients`) and convert its list view to a Responsive Card Grid.
3.  **Integrate Pro**: Move the mobile-specific Pro features into the main Pro module structure, applying the new responsive styles.
4.  **Cleanup**: Delete the deprecated `mobile` folder and any unused `Mobile*` wrapper components that are no longer needed.
5.  **Verify**: Ensure the app looks "Native" on Mobile (Tauri/Android) and "Professional" on Desktop using the same codebase.

**Tech Stack:**
*   React, Tailwind CSS, Tauri
*   Pattern: Atomic Design, Modular Architecture (Core/Pro)

**Deliverable:**
A unified, responsive codebase where `src/modules/core` handles the responsive UI logic for all users, and `src/modules/pro` extensions adapt automatically to the device form factor.
