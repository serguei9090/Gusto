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
- You need to create work summaries, analysis reports, or session logs.

## docs/ Folder Structure

The `/docs` folder serves two purposes:

### 1. **Tracked Documentation** (committed to git)
- Project architecture (`docs/architecture.md`)
- Getting started guides (`docs/getting_started.md`)
- Design standards (`docs/DESIGN_STANDARDS.md`)
- Feature specifications and roadmaps
- Dependency maps and system diagrams
- WIKI.md and other permanent documentation

### 2. **Untracked Summaries/Reports** (NOT committed to git)
- Work session summaries
- Bug fix reports (e.g., `sonarqube-fixes-YYYY-MM-DD.md`)
- Analysis reports
- Temporary notes and findings
- Any useful markdown information for the codebase that doesn't need version control

**Note:** Untracked files should be added to `.gitignore` if they follow a pattern (e.g., `docs/*-summary.md`, `docs/*-report.md`).

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

3. **Create Summaries/Reports** (when needed):
   - For bug fix sessions, create `docs/[tool-name]-fixes-YYYY-MM-DD.md`
   - For analysis work, create `docs/[analysis-type]-report-YYYY-MM-DD.md`
   - For work sessions, create `docs/session-summary-YYYY-MM-DD.md`
   - These files should be added to `.gitignore` if they're temporary

4. **Verify Consistency**:
   - Cross-reference the updated documentation with the code to ensure accuracy.
   - Use clear, concise markdown formatting.

5. **Summarize Changes**:
   - Provide a brief summary of what documentation was updated and why.
