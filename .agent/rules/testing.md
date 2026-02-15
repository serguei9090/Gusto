---
trigger: glob
globs: ["**/*.test.ts", "**/*.spec.ts", "**/tests/**", "src/test/**"]
---

# Testing Requirements

---

## 🧪 Testing Requirements

### Unit Tests (Vitest)

**MUST test:**
- All business logic functions (cost calculations, conversions)
- All service methods (CRUD operations)
- All utility functions (formatters, validators)
- Custom hooks

**Location:** `src/**/*.test.ts`

**Example:**
```typescript
// src/utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRecipeCost } from './calculations';

describe('calculateRecipeCost', () => {
  it('should sum ingredient costs correctly', () => {
    const ingredients = [
      { pricePerUnit: 5, quantity: 2 }, // 10
      { pricePerUnit: 3, quantity: 4 }, // 12
    ];
    expect(calculateRecipeCost(ingredients)).toBe(22);
  });
});
```

### E2E Tests (Playwright)

**MUST test:**
- Critical user flows (add ingredient → create recipe → view cost)
- CRUD operations for each feature
- Form validation and error handling
- Navigation between pages

**Location:** `tests/e2e/`

**Coverage Goal:** > 80% for business logic

---

**Last Updated:** 2026-02-04
