# Field Help System Documentation

## Overview

The Field Help system provides contextual help tooltips for form fields across the RestaurantManage application. This feature improves user experience by offering inline guidance without cluttering the interface.

## Architecture

### Components

#### **FieldHelp Component**
Location: `src/components/ui/field-help.tsx`

A reusable component that renders a modern help icon with tooltip functionality.

**Props:**
```typescript
interface FieldHelpProps {
  readonly helpText: string;     // The help text to display (supports multilingual)
  readonly className?: string;    // Optional custom styling
  readonly side?: "top" | "right" | "bottom" | "left";  // Tooltip position
}
```

**Features:**
- Modern `HelpCircle` icon from lucide-react
- Keyboard accessible (Tab + Enter to activate)
- Click or hover to show tooltip
- Customizable positioning
- Smooth transitions
- Auto-hides after focus loss

**Visual Design:**
- 16x16px icon size
- Muted foreground color (subtle)
- Hover state: transitions to foreground color
- Focus ring for accessibility
- Maximum tooltip width: 300px

---

## Usage

### Basic Usage

```tsx
import { FieldHelp } from "@/components/ui/field-help";
import { useTranslation } from "@/hooks/useTranslation";

export const MyForm = () => {
  const { t } = useTranslation();
  
  return (
    <FormLabel className="flex items-center gap-2">
      {t("common.labels.name")}
      <span className="text-destructive">*</span>
      <FieldHelp helpText={t("ingredients.help.name")} />
    </FormLabel>
  );
};
```

### With Custom Positioning

```tsx
<FieldHelp 
  helpText={t("ingredients.help.currentPrice")} 
  side="bottom"  // Position tooltip below the icon
/>
```

---

## Translation Structure

Help text must be added to both English and Spanish translation files:

### English (`src/locales/en/translation.json`)

```json
{
  "ingredients": {
    "help": {
      "name": "Enter a descriptive name for this ingredient. This will be used throughout the system for identification.",
      "category": "Select the primary category this ingredient belongs to. This helps with organization and filtering.",
      "currentPrice": "The current purchase price for this ingredient from your supplier. This is used to calculate recipe costs.",
      "unitOfMeasure": "The standard unit you use to measure this ingredient (e.g., kg, lbs, liters, pieces).",
      "currentStock": "The current quantity of this ingredient you have on hand in your inventory.",
      "minStockLevel": "Set a minimum stock level. You'll be alerted when inventory falls below this amount.",
      "supplier": "Select the primary supplier for this ingredient. You can add suppliers in the Suppliers section."
    }
  }
}
```

### Spanish (`src/locales/es/translation.json`)

```json
{
  "ingredients": {
    "help": {
      "name": "Ingrese un nombre descriptivo para este ingrediente. Este se utilizará en todo el sistema para su identificación.",
      "category": "Seleccione la categoría principal a la que pertenece este ingrediente. Esto ayuda con la organización y el filtrado.",
      "currentPrice": "El precio de compra actual de este ingrediente de su proveedor. Esto se utiliza para calcular los costos de las recetas.",
      "unitOfMeasure": "La unidad estándar que utiliza para medir este ingredient (por ejemplo, kg, lbs, litros, piezas).",
      "currentStock": "La cantidad actual de este ingrediente que tiene disponible en su inventario.",
      "minStockLevel": "Establezca un nivel mínimo de stock. Se le alertará cuando el inventario caiga por debajo de esta cantidad.",
      "supplier": "Seleccione el proveedor principal de este ingrediente. Puede agregar proveedores en la sección de Proveedores."
    }
  }
}
```

---

## Adding Help to New Forms

### Step 1: Add Translations

Add help text to both `en/translation.json` and `es/translation.json`:

```json
{
  "recipes": {
    "help": {
      "servings": "Number of portions this recipe yields.",
      "prepTime": "Estimated time to prepare this recipe in minutes."
    }
  }
}
```

### Step 2: Import FieldHelp

```tsx
import { FieldHelp } from "@/components/ui/field-help";
```

### Step 3: Add to FormLabel

```tsx
<FormLabel className="flex items-center gap-2">
  {t("recipes.fields.servings")}
  <span className="text-destructive">*</span>
  <FieldHelp helpText={t("recipes.help.servings")} />
</FormLabel>
```

---

## Design Principles

### When to Add Help

✅ **DO add help tooltips when:**
- Field purpose isn't immediately obvious
- There are calculation dependencies (e.g., "Used to calculate X")
- There are system-wide implications (e.g., "Will trigger alerts")
- Multiple similar fields exist (helps differentiate)
- Complex validation rules apply

❌ **DON'T add help tooltips when:**
- Field name is self-explanatory (e.g., "Email" field)
- Help text would just repeat the label
- Form already has comprehensive instructions nearby

### Writing Effective Help Text

1. **Be concise** - Aim for 1-2 sentences maximum
2. **Be specific** - Explain what the field does and why it matters
3. **Be actionable** - Include examples when helpful
4. **Be consistent** - Use the same tone across all help text

**Good Examples:**
- ✅ "Set a minimum stock level. You'll be alerted when inventory falls below this amount."
- ✅ "The current purchase price from your supplier. Used to calculate recipe costs."

**Bad Examples:**
- ❌ "Enter the minimum stock level" (repeats the label)
- ❌ "This is a very important field that you should fill out carefully" (vague)

---

## Accessibility

The FieldHelp component follows WCAG 2.1 AAA guidelines:

- ✅ Keyboard navigable (Tab, Enter, Esc)
- ✅ Screen reader compatible with `aria-label="Help"`
- ✅ Focus visible indicators
- ✅ Color contrast compliant
- ✅ Tooltip dismissible on focus loss or Esc key

---

## Technical Details

### Dependencies

- `@radix-ui/react-tooltip` - Accessible tooltip primitive
- `lucide-react` - Icon library
- `class-variance-authority` - Styling utilities

### Tooltip Behavior

- **Delay:** 300ms before showing (prevents accidental triggers)
- **Trigger:** Click or hover
- **Dismiss:** Click outside, Esc key, or focus loss
- **Position:** Smart positioning (auto-adjusts to viewport)

---

## Examples

### Current Implementations

1. **Ingredient Form** (`src/features/ingredients/components/IngredientForm.tsx`)
   - Name field
   - Category field
   - Unit of Measure field
   - Current Price field
   - Current Stock field
   - Min Stock Level field
   - Supplier field

### Planned Implementations

- Recipe Form (servings, prep time, cost percentage)
- Supplier Form (payment terms, contact info)
- Settings (currency rates, module configuration)

---

## Testing

### Manual Testing Checklist

- [ ] Help icon visible next to field labels
- [ ] Tooltip appears on click
- [ ] Tooltip appears on hover (desktop)
- [ ] Tooltip dismisses on Esc key
- [ ] Tooltip dismisses on click outside
- [ ] Correct text displays in English
- [ ] Correct text displays in Spanish
- [ ] Icon keyboard accessible (Tab navigation)
- [ ] Tooltip positioned correctly (no viewport overflow)
- [ ] Icon styling consistent with design system

---

## Browser Support

Fully tested and supported:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Future Enhancements

Potential improvements for future iterations:

1. **Rich Content Support** - Allow formatted text, links, or images in tooltips
2. **Interactive Tutorials** - Step-by-step guidance for complex forms
3. **Video Help** - Embedded short tutorial videos
4. **Contextual Help Panel** - Dedicated sidebar with expanded help content
5. **Help Search** - Searchable help documentation
6. **Analytics** - Track which help tooltips are most used (identify UX issues)

---

## Maintenance

### Adding New Help Text

1. Update `en/translation.json` with English text
2. Update `es/translation.json` with Spanish translation
3. Add `<FieldHelp>` component to the form field
4. Test in both languages
5. Document the change in this file

### Updating Existing Help Text

1. Modify text in both translation files
2. Test that changes appear correctly
3. Update documentation if necessary

---

## Support

For questions or issues with the Field Help system:
- Review this documentation
- Check existing implementations in `src/features/ingredients/components/IngredientForm.tsx`
- Reference `src/components/ui/field-help.tsx` source code
- Consult Design Standards documentation

---

**Last Updated:** 2026-02-07  
**Version:** 1.0.0
