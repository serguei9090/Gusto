# Mobile Design Rules

---

## 📱 Mobile-First Architecture

### Layout Strategy
- **Header**: Use `MainLayout` mobile header. Height: `64px` (`h-16`).
- **Navigation**: Use Bottom Navigation (`MobileNav`) for primary views.
- **Sidebar**: Use ONLY inside a Hamburger menu (Sheet/Drawer). NEVER render inline on mobile.
- **Safe Areas**: ALWAYS respect device safe areas (notch, home indicator).

### Spacing & Touch Targets
- **Touch Targets**: Minimum `44x44px` for all interactive elements.
- **Padding**: 
  - Content: `p-4` (16px) minimum.
  - Safe Area Top: `pt-safe` or `padding-top: env(safe-area-inset-top)`.
  - Safe Area Bottom: `pb-safe` or `padding-bottom: env(safe-area-inset-bottom)`.

### Viewport & Scaling
- Prevent zooming on inputs: `font-size: 16px` minimum for inputs.
- dynamic viewport height: Use `dvh` instead of `vh` where possible.

### Component Guidelines
- **Titles**: 
  - Mobile: Use the Header title (`MainLayout`).
  - Desktop: Use the Page title (`h2`).
  - **AVOID DUPLICATES**: If `isMobile` is true, hide the page-level `h2`.
- **Grids**:
  - Mobile: `grid-cols-1`.
  - Tablet: `grid-cols-2`.
  - Desktop: `grid-cols-4`.
- **Cards**: Use `MobileCard` component (from Mobile Registry) for list items.

---

**Last Updated**: 2026-02-11
