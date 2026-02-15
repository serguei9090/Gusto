---
trigger: always_on
---

# Styling & Design System Rules

## 🎨 Design System Rules

### 1. Tailwind CSS (Single Source of Truth)

**Standard:** All styling MUST be done using **Tailwind CSS Utility Classes**.

- **No CSS Modules:** Do not use `.module.css` files.
- **No Inline Styles:** Avoid logic in `style={{ ... }}` unless dynamic values (like coordinates) require it.

### 2. Class Merging

**Standard:** Use the `cn()` utility (clsx + tailwind-merge) for all dynamic classes.

```typescript
import { cn } from "@/lib/utils";

export function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(
        "rounded-md px-4 py-2 font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        className
      )}
      {...props}
    />
  );
}
```

### 3. Design Tokens (Tailwind Theme)

Reference theme variables in `src/index.css` via `@theme` or Tailwind config.

**Usage:**
- Use `text-primary` instead of `text-[#...]`
- Use `bg-background` instead of `bg-white`
- Use `rounded-md` instead of `rounded-[8px]`

### 4. Animations

- **Micro-interactions:** Use Tailwind `transition-*` classes.
- **Complex Animations:** Use `framer-motion` for shared layout animations and gestures.

---

**Last Updated:** 2026-02-15
