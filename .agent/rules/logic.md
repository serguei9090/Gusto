# Business Logic Rules

---

## 📊 Business Logic Rules

### Cost Calculation Standards

**Recipe Costing:**
```typescript
// MUST recalculate costs when:
// 1. Ingredient prices change
// 2. Recipe ingredients are added/removed
// 3. Recipe quantities change

function calculateRecipeCost(ingredients: RecipeIngredient[]): number {
  return ingredients.reduce((total, item) => {
    const cost = item.ingredient.pricePerUnit * item.quantity;
    return total + cost;
  }, 0);
}
```

**Food Cost Percentage:**
```typescript
function calculateFoodCostPercentage(
  totalCost: number,
  sellingPrice: number
): number {
  if (sellingPrice === 0) return 0;
  return (totalCost / sellingPrice) * 100;
}
```

**Validation Rules:**
- Prices MUST be positive numbers
- Quantities MUST be positive
- Food cost percentage should be between 20-40% (warning if outside)
- Stock levels CANNOT be negative

---

**Last Updated:** 2026-02-04
