# Ingredient Form Reorganization - Implementation Plan

## Status: IN PROGRESS
**File**: `src/modules/core/ingredients/components/IngredientForm.tsx`

## ✅ Completed Steps
1. Added Accordion component imports (lines 5-10)

## 📋 Remaining Steps

### Step 1: Reorganize Form Structure

**Current Layout** (Lines 130-481):
All fields are visible at once in this order:
1. Name (Mandatory) - Line 130-151
2. Category (Mandatory) + Unit of Measure - Lines 153-211  
3. Pricing Configuration Section - Lines 213-377
4. Currency - Lines 379-397
5. Current Stock + Min Stock Level - Lines 399-460
6. Supplier - Lines 462-481

**New Layout Required**:

**PRIMARY SECTION** (Always Visible):
1. Name (Mandatory, asterisk *)
2. Unit of Measure (Mandatory, asterisk *)
3. Pricing Configuration (Optional, defaults to 0)
   - Keep the Per Unit / By Package toggle
   - Keep all pricing logic as-is
4. Supplier (Optional)

**SECONDARY SECTION** (Collapsible Accordion - "Additional Information"):
1. Category (Optional, no asterisk)
2. Currency (Optional, defaults to USD)
3. Current Stock (Optional, defaults to 0)
4. Minimum Stock Level (Optional, defaults to 0)

### Step 2: Update Validation Schema
**File**: `src/utils/validators.ts`

The `createIngredientSchema` currently marks `category` as required. This needs to be changed to optional:

```typescript
// BEFORE:
category: z.string().min(1, "Category is required"),

// AFTER:
category: z.string().optional(),
```

### Step 3: Remove Mandatory Asterisks
Fields to update (remove asterisk and "required" message):
- Category (currently line 161)
- Price Per Unit (currently line 348)

These should become optional with placeholder defaults.

## 🎯 Expected UX Benefits

### Before:
- 10+ visible fields on initial load
- Overwhelming for quick ingredient entry
- Required fields mixed with optional
- Scroll distance: ~900px

### After:
- 4 essential fields + pricing (collapsible internal section)
- Clean, focused entry experience  
- Optional fields accessible but hidden
- Scroll distance: ~450px (50% reduction)

## 📐 Implementation Details

### Accordion Placement
Insert after the Supplier field (after line 481), before MobileFormFooter:

```tsx
{/* SECONDARY SECTION - Collapsible Additional Information */}
<Accordion type="single" collapsible className="border rounded-lg">
  <AccordionItem value="additional-info" className="border-none">
    <AccordionTrigger className="px-4 hover:no-underline">
      <span className="text-base font-semibold">
        Additional Information
      </span>
    </AccordionTrigger>
    <AccordionContent className="px-4 pb-4 space-y-4">
      {/* Move Category here */}
      {/* Move Currency here */}
      {/* Move Current Stock & Min Stock Level here */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Field Order in Primary Section
1. Name - Keep as-is (lines 130-151)
2. Unit of Measure - Move up, remove from grid (currently line 189-210)
3. Pricing Configuration - Keep as-is (lines 213-377)
4. Supplier - Keep as-is (lines 462-481)

### Fields to Move to Accordion
1. Category (lines 154-186) - Remove asterisk, remove "required"
2. Currency (lines 379-397)
3. Current Stock + Min Stock Level grid (lines 399-460)

## 🧪 Testing Checklist

After implementation:
- [ ] Can create ingredient with only Name + Unit of Measure
- [ ] Price defaults to 0 when not provided
- [ ] Category defaults to empty/null when not provided  
- [ ] Currency defaults to USD
- [ ] Stock levels default to 0
- [ ] Accordion expands/collapses smoothly
- [ ] All fields save correctly
- [ ] Form validation works as expected
- [ ] Mobile view looks clean

## 🚨 Important Notes

1. **Pricing Logic**: Keep all existing pricing calculations intact
   - Per Unit / By Package toggle
   - Auto-calculation of price per unit in package mode
   - All useEffect hooks for pricing

2. **Backward Compatibility**: Existing ingredients with categories should still load correctly

3. **Validation Schema**: Must update `createIngredientSchema` to make `category` optional

## Next Action Required

Would you like me to proceed with the full reorganization, or would you prefer to review this plan first?

The changes will be substantial (~200 lines moved/modified) but follow the exact same pattern we used successfully for the Recipe form.
