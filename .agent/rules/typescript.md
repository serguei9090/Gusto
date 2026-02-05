# TypeScript & Validation Rules

---

## 💻 TypeScript Standards

**MUST:**
- Enable strict mode in `tsconfig.json`
- NEVER use `any` type (use `unknown` and type guards)
- Define interfaces for all data structures
- Use Zod for runtime validation
- Export types alongside components

**Example:**
```typescript
// ✅ GOOD
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
}

// ❌ BAD
function Button(props: any) { ... }
```

---

## Validation with Zod

All input data MUST be validated with Zod schemas:

```typescript
import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(["protein", "vegetable", "dairy"]),
});

// Use in service
const validated = createIngredientSchema.parse(data);
```

---

**Last Updated:** 2026-02-04
