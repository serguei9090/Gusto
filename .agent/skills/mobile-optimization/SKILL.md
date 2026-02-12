---
name: mobile-optimization
description: Guidelines and checklists for optimizing mobile views in Gusto, ensuring correct safe-area usage, avoiding double headers, and responsive layouts.
---

# Mobile Optimization Skill

This skill ensures consistent and high-quality mobile experiences for the Gusto application.

> [!NOTE]
> For detailed CSS specs, button sizing, and form standards, always refer to [docs/MOBILE_DESIGN_SYSTEM.md](../../docs/MOBILE_DESIGN_SYSTEM.md).

## 📱 Mobile Architecture Checklist

When implementing or modifying mobile views:

- [ ] **Header Strategy**: 
  - The `MainLayout` provides the mobile header with hamburger menu and title.
  - **HIDE** page-level `h1`/`h2` titles if `isMobile` is true to avoid duplication.
- [ ] **Safe Areas**:
  - Add `pt-safe` and `pb-safe` utilities or padding to `MainLayout` containers.
  - Ensure content is not cut off by the notch or home indicator.
- [ ] **Navigation**:
  - Use `MobileNav` (from registry) for primary navigation.
  - Ensure bottom padding accounts for the nav bar height (`pb-20` is common).
- [ ] **Lists & Cards**:
  - Use `MobileCardList` and `MobileCard` components.
  - Avoid horizontal scrolling tables on mobile; use card layouts instead.

## 🛠 Common Fixes

### Fix: Double Header / Title
**Problem**: You see "Dashboard" in the top bar AND "Dashboard" in the page content.
**Solution**:
```tsx
// In PageComponent.tsx
const isMobile = useMobile();
return (
  <div className="space-y-4">
    {!isMobile && <h2>{t("page.title")}</h2>} {/* Hide on mobile */}
    {/* content */}
  </div>
);
```

### Fix: Status Bar Overlap
**Problem**: Hamburger menu or title is behind the device status bar.
**Solution**:
Use `safe-area-inset-top` in your layout CSS or Tailwind class.
```css
.mobile-header {
  padding-top: env(safe-area-inset-top);
  height: calc(4rem + env(safe-area-inset-top)); /* 64px + safe area */
}
```

### Fix: Click Targets
**Problem**: Buttons are too small to tap easily.
**Solution**: ensure `min-height: 44px` and `min-width: 44px` for touch targets.
