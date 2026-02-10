---
name: component-creator
description: Use this skill when creating new React components. It enforces the Atomic Design structure, Tailwind CSS usage, and shadcn/ui integration for building atoms, molecules, and organisms.
---

# Component Creator Skill

This skill guides you through creating new React components following the RestaurantManage design system and architectural standards.

## When to Use This Skill

Use this skill when:
- Creating a new UI component (atom, molecule, organism, etc.)
- Adding a shadcn/ui component
- Styling components with Tailwind CSS

## Component Categories

| Category | Location | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **Base UI (Shadcn)** | `src/components/ui` | Core, unstyled primitives. Do NOT manually edit unless necessary. | Button, Input, Select, Dialog |
| **Atoms** | `src/components/atoms` | Smallest functional units, often wrapping Base UI. | StatusBadge, LoadingButton, Icon |
| **Molecules** | `src/components/molecules` | Groups of atoms functioning together. | SearchBar, UserCard, FormField |
| **Organisms** | `src/components/organisms` | Complex UI sections. | Header, Sidebar, DataTable |
| **Module Components** | `src/modules/.../components` | Components specific to a feature module. | InventoryTable, RecipeForm |

## Workflow

### 1. Adding a Base UI Component (Shadcn)

If you need a standard UI element (e.g., Accordion, Calendar), check if it's available in shadcn/ui.

```bash
# Add a component using the CLI
bun x shadcn@latest add [component-name]
```

This will create the component in `src/components/ui/[component-name].tsx`.

### 2. Creating a Custom Component (Atom/Molecule)

Follow these rules for custom components:

1.  **File Structure**: Create a directory with the component name.
    ```
    src/components/atoms/MyComponent/
    ├── MyComponent.tsx
    └── index.ts
    ```

2.  **Styles**: Use **Tailwind CSS classes**. Do NOT use CSS modules or `style` props.
    - Use `cn()` utility to merge classes.
    - Support `className` prop for overrides.

3.  **Props**: extend HTML attributes where applicable.

#### Template: `MyComponent.tsx`

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Define variants using CVA (optional but recommended for atoms)
const myComponentVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. Define Props Interface
export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {
  asChild?: boolean;
}

// 3. Create Component
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Logic here
    
    return (
      <div
        className={cn(myComponentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
MyComponent.displayName = "MyComponent";

export { MyComponent, myComponentVariants };
```

#### Template: `index.ts`

```typescript
export * from "./MyComponent";
```

### 3. Using Components

Import form the alias path:

```typescript
import { Button } from "@/components/ui/button";
import { MyComponent } from "@/components/atoms/MyComponent";
```

## Checklist

- [ ] Component uses Tailwind CSS for all styling.
- [ ] Component accepts `className` and merges it with `cn()`.
- [ ] Component exports its interface.
- [ ] No `any` types used.
- [ ] Interactive elements have proper ARIA attributes (often handled by Radix/Shadcn).
