# Project Folder Structure Rules

## `.agent/` Folder
**Purpose:** Skills, rules, and workflows ONLY

**Contains:**
- `skills/` - Reusable skill definitions (SKILL.md files)
- `workflows/` - Workflow definitions (.md files)
- `RULES.md` - Project-specific coding rules and standards

**Does NOT contain:**
- Documentation
- Summaries
- Reports
- Session logs

---

## `docs/` Folder
**Purpose:** All documentation, reports, summaries, and useful markdown information

**Git Status:** Entire folder is in `.gitignore` (not tracked by git)

**Contains:**

### 1. **Tracked Documentation** (if you choose to commit specific files)
- Project architecture
- Getting started guides
- Design standards
- Feature specifications and roadmaps
- Dependency maps and system diagrams
- WIKI.md and other permanent documentation

### 2. **Untracked Summaries/Reports** (default behavior)
- Work session summaries
- Bug fix reports (e.g., `sonarqube-fixes-YYYY-MM-DD.md`)
- Analysis reports
- Temporary notes and findings
- Any useful markdown information for the codebase

**Naming Conventions:**
- Bug fix reports: `[tool-name]-fixes-YYYY-MM-DD.md`
- Analysis reports: `[analysis-type]-report-YYYY-MM-DD.md`
- Session summaries: `session-summary-YYYY-MM-DD.md`

---

## `CHANGELOG.md` (Root)
**Purpose:** Version history and release notes

**Git Status:** Tracked (committed to git)

**Contains:**
- Version numbers and dates
- Added features
- Changed functionality
- Fixed bugs
- Deprecated features
- Removed features

**Format:** Follows [Keep a Changelog](https://keepachangelog.com/) format

---

## Summary

| Location | Purpose | Git Tracked | Use For |
|----------|---------|-------------|---------|
| `.agent/` | Skills, rules, workflows | ✅ Yes | Reusable agent instructions |
| `docs/` | Documentation & reports | ❌ No (by default) | Any markdown documentation or summaries |
| `CHANGELOG.md` | Version history | ✅ Yes | Release notes and version changes |
