# Changelog

All notable changes to this project will be documented in this file.

## [1.0.5] - 2026-02-10

### Added
- **Differentiated Builds**: Implemented unique filenames and product names for Core and Pro versions (`Gusto Core` vs `Gusto Pro`).
- **Dynamic Versioning**: Centralized version management in `package.json`, automatically syncing Tauri configuration and the in-app "About" dialog.

### Changed
- **Performance Optimization**: Implemented Code Splitting (lazy loading) for all major modules and manual chunking for vendor libraries, reducing initial bundle size by 50%.
- **Import Standardization**: Resolved build warnings by converting core store dynamic imports to static imports.

### Fixed
- **Dashboard Stability**: Fixed a critical bug in `WidgetRegistry` where non-immutable updates caused infinite React re-renders and prevented widgets from appearing on initial load.
- **Type Safety**: Eliminated multiple `any` type assertions across repository tests and stores, improving codebase reliability and lint compliance.
- **UI Polishing**: Added loading spinners for lazy-loaded modules using React Suspense.

## [1.0.4] - 2026-02-09

### Added
- **Sub-Recipes**: Implemented complete nested recipe functionality allowing recipes to be used as ingredients.
- **Recipe Yield System**: Added Batch Yield and Yield Unit for precise production tracking.
- **Searchable Selectors**: Added Search/Filter box to ingredient/recipe dropdowns in forms.
- **Dynamic Configuration**: Added drag-and-drop reordering for Units, Ingredient Categories, and Recipe Categories.

### Changed
- **Unified Validation**: Generalized category and unit schemas to support fully custom user configurations without hardcoded limits.
- **UI Enhancements**: Added mandatory field indicators (*) and red validation error highlighting.

### Fixed
- **Recipe Saving Bug**: Resolved issue preventing recipe saving when using custom categories.
- **Kysely Driver Update**: Fixed deprecation warning for `numUpdatedOrDeletedRows` by switching to `numAffectedRows`.
- **Duplicate Prevention**: Implemented database-level and store-level checks to prevent duplicate category names.


## [1.0.3] - 2026-02-08

### Fixed
- Resolved Biome `MODULE_NOT_FOUND` error in CI by using the official `setup-biome` action.
- Switched CI runner to `windows-latest` to resolve native dependency issues (Rollup/Bun) on Linux.
- Ensured cross-platform compatibility for linting process.


## [1.0.2] - 2026-02-08

### Improved
- Automated release notes extraction from CHANGELOG.md.
- Updated README with badges and project branding.
- Fixed Linux-specific dependency resolution in CI.


## [1.0.1] - 2026-02-08

### Fixed
- Fixed failing unit tests in `costEngine.test.ts` by aligning test expectations with Food Cost Percentage logic.
- Resolved various linting errors preventing CI from passing.

## [1.0.0] - 2026-02-08

### Added
- Initial release of Gusto Restaurant Manager.
- CI/CD pipeline setup for Windows build and testing.
