# Pre-commit Workflow with Auto-Format

## How It Works

The pre-commit hook uses Lefthook's `stage_fixed: false` option:

1. **Automatically formats** your staged files
2. **Does NOT auto-stage** the formatted files  
3. **Commit fails** because of unstaged changes
4. **You review, stage, and commit again**

## Workflow

```bash
# 1. Make your changes and stage them
git add src/MyComponent.tsx

# 2. Try to commit
git commit -m "Add new feature"

# 🔧 Lefthook runs formatter
# ✅ Files get formatted
# ❌ Commit fails - formatted files not staged

# 3. Review what was formatted
git diff

# 4. Stage the formatted files
git add .

# 5. Commit again
git commit -m "Add new feature"
# ✅ Success! One clean commit with properly formatted code
```

## Benefits

✅ **Automatic formatting** - No need to remember to format  
✅ **Prevents double commits** - Only one commit, already formatted  
✅ **Review changes** - You see what was formatted before committing  
✅ **Native solution** - Uses Lefthook's built-in feature  

## Key Setting

```yaml
stage_fixed: false  # This prevents auto-staging formatted files
```

This ensures the commit fails if formatting changes were made, giving you a chance to review and stage them explicitly.
