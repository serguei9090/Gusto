# Pre-commit Workflow

## How It Works Now

The pre-commit hook will **block your commit** if any formatting or linting issues are detected. This ensures all commits contain properly formatted code from the start.

## Workflow

1. **Make your changes** to the code
2. **Stage your files**: `git add .`
3. **Try to commit**: `git commit -m "your message"`
4. **If the commit fails** due to formatting issues:
   - The hook will show you what needs to be fixed
   - Run the formatter manually: `bun x @biomejs/biome check --write .`
   - Stage the formatted files: `git add .`
   - Commit again: `git commit -m "your message"`

## Benefits

- ✅ Only one commit with properly formatted code
- ✅ No more double commits (unformatted + auto-formatted)
- ✅ Explicit formatting step helps you see what changed
- ✅ Cleaner git history

## Manual Formatting Commands

Format all files:
```bash
bun x @biomejs/biome check --write .
```

Format specific files:
```bash
bun x @biomejs/biome check --write src/components/Sidebar.tsx
```

Check without fixing (what pre-commit does):
```bash
bun x @biomejs/biome check --error-on-warnings .
```

## Type Checking

The pre-commit hook also runs TypeScript type checking. If types fail:
```bash
bun run type-check
```

Fix any type errors before committing.
