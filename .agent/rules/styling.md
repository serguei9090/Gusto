# Styling & Design System Rules

---

## 🎨 Design System Rules

### CSS Architecture

**Global Styles Location:**
```
src/styles/
├── index.css         ← Design tokens, variables, resets
├── reset.css         ← CSS reset (optional)
└── utilities.css     ← Utility classes (optional)
```

**Design Tokens (CSS Variables - MUST USE):**
```css
:root {
  --color-primary-500: #22c55e;
  --space-md: 1rem;
  --radius-md: 0.5rem;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Component Styles:**
- Use CSS Modules (`.module.css`)
- Reference design tokens for colors, spacing, borders
- NO hardcoded values (use variables)
- Mobile-first responsive design

**Example:**
```css
/* ✅ GOOD */
.button {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary-500);
  border-radius: var(--radius-md);
}

/* ❌ BAD */
.button {
  padding: 8px 16px;
  background: #22c55e;
  border-radius: 8px;
}
```

---

**Last Updated:** 2026-02-04
