---
description: Standards for mobile UI development in Gusto, covering layout, safe areas, and components.
---

# Mobile UI Standards

## 📱 Core Layout Philosophy
Mobile views in Gusto follow a strict "Fixed Shell, Scrollable Core" architecture to ensure native-like performance and feel.

### Anatomy of a Page
1.  **Header (`z-50`)**: Fixed height, pinned to top, handles `safe-area-inset-top`.
2.  **Content (`z-0`)**: Flex-growable area, handles scrolling, pads top/bottom to avoid concealment.
3.  **Footer (`z-50`)**: Fixed or sticky, pinned to bottom, handles `safe-area-inset-bottom`.

## 🛡️ Safe Area Handling
Never hardcode padding for notches or home indicators. Use the provided utility classes in `mobile-native.css`.

| Area | Class | CSS Rule | Implementation Helper |
| :--- | :--- | :--- | :--- |
| **Top Safe Area** | `.pt-safe` | `padding-top: env(safe-area-inset-top)` | `MobileHeader` handles this auto-magically. |
| **Bottom Safe Area** | `.pb-safe` | `padding-bottom: env(safe-area-inset-bottom)` | Add to footer containers or the last element of a scroll view. |

## 🧩 Component Standards

### 1. Headers (`MobileHeader`)
- **Height**: `4rem` (64px) + Safe Area Top.
- **Z-Index**: `100` (Fixed Header).
- **Style**: `.fixed-header-mobile` class.

### 2. Content Areas (`ScrollArea`)
- **Container**: `flex-1 w-full min-h-0`.
- **Padding**: Horizontal `px-4` is standard.
- **Bottom Spacer**: Always add `pb-24` or similar to the *content inside* the scroll view if a floating footer is present.

### 3. Footers (`MobileFooterClose`)
- **Positioning**: Sticky `bottom-0` or Fixed `bottom-0`.
- **Height**: Auto, but buttons are typically `h-12` (48px).
- **Padding**: `p-4` + `pb-safe`.
- **Background**: Glassmorphism (`.glass-footer`) or solid background.

### 4. Dialogs (`DialogContent`)
- **Mobile Mode**: Must fill screen `fixed inset-0`.
- **Padding**: `pt-[calc(4rem+env(safe-area-inset-top))]` to clear header if checking `isMobile`.
- **Z-Index**: `150` (To sit above Headers/Footers).

## ⚠️ Common Pitfalls to Avoid
1.  **Accumulating Padding**: Do not add padding to the Dialog *and* the Layout *and* the ScrollView. Pick one layer.
2.  **Missing `min-h-0`**: Flex children need `min-h-0` to scroll correctly within a tailored height.
3.  **Hardcoded Bottoms**: Never use `bottom: 0px` without considering `env(safe-area-inset-bottom)`.

## 📋 Checklist for New Mobile Pages
- [ ] Header uses `.fixed-header-mobile`.
- [ ] Main content is wrapped in `dvh` or `flex-1` container.
- [ ] Input fields are at least 48px high.
- [ ] Bottom actions use `pb-safe`.
