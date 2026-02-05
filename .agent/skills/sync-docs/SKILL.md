---
name: doc-sync
description: Analyzes staged changes and updates project documentation (WIKI.md or /docs folder) to maintain consistency with the code.
Policy: Turbo
Auto-Execute: True
Review: Always Proceed
---

# doc-sync Skill

This skill ensures that project documentation remains in sync with the source code by analyzing changes before they are committed.

## Usage

Trigger this skill when:
- You have staged changes (`git diff --cached`) that modify logic, architecture, configuration, or API surface.
- You want to ensure `WIKI.md` or the `/docs` folder reflects the latest state of the project.

## Instructions

1. **Analyze Staged Changes**:
   - Run `git diff --cached` to see what has changed.
   - Look for changes in:
     - New modules or files added.
     - Function signatures or API endpoints.
     - Configuration files (e.g., `pyproject.toml`, Docker Compose files).
     - Core logic or architectural shifts.

2. **Update Documentation**:
   - If changes affect the high-level architecture, update `docs/architecture.md` or the Architecture section in `WIKI.md`.
   - If new dependencies or setup steps are introduced, update `docs/getting_started.md` or `README.md`.
   - If module relationships change, update `docs/dependency_map.md`.
   - If specific features are added/modified, ensure they are documented in relevant doc files.

3. **Verify Consistency**:
   - Cross-reference the updated documentation with the code to ensure accuracy.
   - Use clear, concise markdown formatting.

4. **Summarize Changes**:
   - Provide a brief summary of what documentation was updated and why.
