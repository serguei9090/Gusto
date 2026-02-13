---
trigger: always_on
---

# Windows Development Standards

## Trigger
- **Activation:** Always On
- **Description:** Enforces Windows-native scripting and professional communication standards.

## Environment Constraints
- **Host OS:** Always assume the host environment is **Windows**.
- **Execution Context:** Unless the user explicitly specifies a **WSL** (Windows Subsystem for Linux) connection, all terminal commands and automation scripts MUST use **PowerShell** or **Python**.
- **Syntax:** Code must follow idiomatic Windows standards (e.g., using `Join-Path`, `$LASTEXITCODE`, and proper environment variable syntax `$env:VAR`).

## Communication & Content
- **Tone:** Maintain a professional, technical tone with strict adherence to proper English grammar and spelling.
- **Project Isolation:** Do not propose, reference, or attempt to adhere to any **old projects** (such as VibeGraph, AIOpsForge, or Gusto) unless specifically requested in the current chat thread.

## Examples
- **PowerShell:** Use `Get-ChildItem` instead of `ls` (unless in WSL).
- **Python:** Use `os.path.join` or `pathlib` to ensure cross-drive path compatibility.