---
name: recipe-costing
description: Implement recipe costing and inventory management business logic for restaurant applications, including cost calculations, unit conversions, profit margins, and inventory tracking.
---

# Recipe Costing & Inventory Management Skill

This skill provides battle-tested patterns and formulas for implementing restaurant recipe costing, inventory management, and profitability calculations.

## When to Use This Skill

Use this skill when implementing:
- Recipe cost calculations
- Food cost percentage computations
- Profit margin analysis
- Unit conversion systems
- Inventory transaction processing
- Stock level alerts
- Price history tracking
- Supplier price comparisons

## Core Business Logic Patterns

### 1. Recipe Cost Calculation

**Formula:** Sum of (ingredient quantity × ingredient unit price)

```typescript
interface RecipeIngredient {
  ingredient: {
    id: number;
    name: string;
    pricePerUnit: number; // Normalized price per base unit
    unitOfMeasure: string; // Base unit (kg, L, etc.)
  };
  quantity: number;
  unit: string; // May differ from base unit
}

/**
 * Calculate total cost of a recipe
 * Handles unit conversions automatically
 */
function calculateRecipeCost(recipeIngredients: RecipeIngredient[]): number {
  return recipeIngredients.reduce((total, item) => {
    // Convert quantity to base unit if necessary
    const baseQuantity = convertToBaseUnit(
      item.quantity,
      item.unit,
      item.ingredient.unitOfMeasure
    );
    
    const itemCost = baseQuantity * item.ingredient.pricePerUnit;
    return total + itemCost;
  }, 0);
}
```

**Important Considerations:**
- Always store prices in the smallest currency unit (cents, not dollars)
- Round final costs to 2 decimal places for display
- Cache calculated costs to avoid repeated calculations
- Recalculate when ingredient prices change

### 2. Food Cost Percentage

**Formula:** (Total Recipe Cost / Selling Price) × 100

```typescript
/**
 * Calculate food cost percentage
 * Industry standard: 28-35% is ideal
 */
function calculateFoodCostPercentage(
  totalCost: number,
  sellingPrice: number
): number {
  if (sellingPrice === 0) {
    throw new Error('Selling price cannot be zero');
  }
  
  return (totalCost / sellingPrice) * 100;
}

/**
 * Determine if food cost percentage is acceptable
 */
function isFoodCostAcceptable(
  percentage: number,
  targetPercentage: number = 32 // Default industry standard
): boolean {
  const tolerance = 3; // ±3% tolerance
  return Math.abs(percentage - targetPercentage) <= tolerance;
}
```

**Industry Benchmarks:**
- Fast Casual: 25-30%
- Fine Dining: 30-35%
- Casual Dining: 28-32%
- Quick Service: 25-28%

### 3. Profit Margin Calculation

**Formula:** ((Selling Price - Total Cost) / Selling Price) × 100

```typescript
/**
 * Calculate profit margin percentage
 */
function calculateProfitMargin(
  sellingPrice: number,
  totalCost: number
): number {
  if (sellingPrice === 0) {
    throw new Error('Selling price cannot be zero');
  }
  
  const profit = sellingPrice - totalCost;
  return (profit / sellingPrice) * 100;
}

/**
 * Calculate required selling price to achieve target margin
 */
function calculateSellingPrice(
  totalCost: number,
  targetMarginPercentage: number
): number {
  // Selling Price = Cost / (1 - Margin%)
  return totalCost / (1 - targetMarginPercentage / 100);
}

// Example: If cost is $10 and target margin is 40%
// Selling Price = 10 / (1 - 0.40) = 10 / 0.60 = $16.67
```

### 4. Unit Conversion System

**Critical for accurate costing across different measurement units**

```typescript
// Define conversion factors (always to base unit)
const conversionFactors: Record<string, Record<string, number>> = {
  // Mass conversions
  'kg': { 'g': 1000, 'mg': 1_000_000, 'lb': 2.20462, 'oz': 35.274 },
  'g': { 'kg': 0.001, 'mg': 1000, 'lb': 0.00220462, 'oz': 0.035274 },
  
  // Volume conversions
  'l': { 'ml': 1000, 'cup': 4.22675, 'tbsp': 67.628, 'tsp': 202.884, 'gal': 0.264172 },
  'ml': { 'l': 0.001, 'cup': 0.00422675, 'tbsp': 0.067628, 'tsp': 0.202884 },
  
  // Count (no conversion needed)
  'piece': { 'piece': 1, 'dozen': 1/12 },
};

/**
 * Convert from one unit to another
 */
function convertUnits(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  if (fromUnit === toUnit) return value;
  
  // Normalize units (lowercase)
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();
  
  // Check if conversion exists
  if (!conversionFactors[from]?.[to]) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
  
  return value * conversionFactors[from][to];
}

/**
 * Convert to base unit for consistent pricing
 */
function convertToBaseUnit(
  quantity: number,
  currentUnit: string,
  baseUnit: string
): number {
  return convertUnits(quantity, currentUnit, baseUnit);
}
```

**Usage Example:**
```typescript
// Ingredient stored as kg with price per kg = $5
// Recipe calls for 500g

const pricePerKg = 5;
const recipeQuantity = 500;
const recipeUnit = 'g';
const baseUnit = 'kg';

const quantityInKg = convertToBaseUnit(recipeQuantity, recipeUnit, baseUnit);
// 500g → 0.5kg

const cost = quantityInKg * pricePerKg;
// 0.5 × $5 = $2.50
```

### 5. Inventory Management

#### Stock Level Tracking

```typescript
/**
 * Update inventory stock after purchase or usage
 */
async function updateInventoryStock(
  ingredientId: number,
  quantityChange: number, // Positive = addition, negative = usage
  transactionType: 'purchase' | 'usage' | 'adjustment' | 'waste'
): Promise<void> {
  // Begin transaction
  await db.transaction(async (tx) => {
    // Update current stock
    await tx.update(ingredients)
      .set({ 
        currentStock: sql`current_stock + ${quantityChange}`,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(ingredients.id, ingredientId));
    
    // Record transaction
    await tx.insert(inventoryTransactions).values({
      ingredientId,
      transactionType,
      quantity: quantityChange,
      createdAt: new Date().toISOString(),
    });
  });
}
```

#### Low Stock Alerts

```typescript
/**
 * Check for ingredients below minimum stock level
 */
async function getLowStockIngredients(): Promise<Ingredient[]> {
  return await db
    .select()
    .from(ingredients)
    .where(
      and(
        sql`current_stock < min_stock_level`,
        isNotNull(ingredients.minStockLevel)
      )
    );
}

/**
 * Calculate reorder quantity
 * Uses Economic Order Quantity (EOQ) formula for optimization
 */
function calculateReorderQuantity(
  averageDailyUsage: number,
  leadTimeDays: number,
  safetyStockDays: number = 3
): number {
  const leadTimeUsage = averageDailyUsage * leadTimeDays;
  const safetyStock = averageDailyUsage * safetyStockDays;
  
  return leadTimeUsage + safetyStock;
}
```

#### Recipe Production Impact

```typescript
/**
 * Calculate inventory impact of producing a recipe
 */
async function calculateRecipeInventoryImpact(
  recipeId: number,
  servings: number
): Promise<{ ingredientId: number; quantityNeeded: number; available: number; shortfall: number }[]> {
  const recipe = await getRecipeById(recipeId);
  const baseServings = recipe.servings;
  const multiplier = servings / baseServings;
  
  const impacts = [];
  
  for (const recipeIngredient of recipe.ingredients) {
    const neededQuantity = recipeIngredient.quantity * multiplier;
    const ingredient = await getIngredientById(recipeIngredient.ingredientId);
    
    impacts.push({
      ingredientId: ingredient.id,
      quantityNeeded: neededQuantity,
      available: ingredient.currentStock,
      shortfall: Math.max(0, neededQuantity - ingredient.currentStock),
    });
  }
  
  return impacts;
}
```

### 6. Price History & Trend Analysis

```typescript
/**
 * Record price change for historical analysis
 */
async function recordPriceChange(
  ingredientId: number,
  newPrice: number,
  supplierId?: number
): Promise<void> {
  // Record in price history
  await db.insert(priceHistory).values({
    ingredientId,
    price: newPrice,
    supplierId,
    recordedAt: new Date().toISOString(),
  });
  
  // Update current price
  await db.update(ingredients)
    .set({ 
      currentPrice: newPrice,
      pricePerUnit: newPrice, // Assuming price is per base unit
      lastUpdated: new Date().toISOString(),
    })
    .where(eq(ingredients.id, ingredientId));
  
  // Trigger recipe cost recalculation
  await recalculateAffectedRecipes(ingredientId);
}

/**
 * Calculate price trend (7-day, 30-day, 90-day)
 */
async function calculatePriceTrend(
  ingredientId: number,
  days: number = 30
): Promise<{ trend: 'increasing' | 'decreasing' | 'stable'; percentageChange: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const history = await db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.ingredientId, ingredientId),
        gte(priceHistory.recordedAt, cutoffDate.toISOString())
      )
    )
    .orderBy(priceHistory.recordedAt);
  
  if (history.length < 2) {
    return { trend: 'stable', percentageChange: 0 };
  }
  
  const oldestPrice = history[0].price;
  const newestPrice = history[history.length - 1].price;
  const percentageChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(percentageChange) < 5) {
    trend = 'stable';
  } else if (percentageChange > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  
  return { trend, percentageChange };
}
```

### 7. Supplier Price Comparison

```typescript
/**
 * Find best supplier for an ingredient based on price
 */
async function findBestSupplier(
  ingredientId: number
): Promise<{ supplierId: number; price: number; savings: number }> {
  // Get recent prices from all suppliers
  const recentPrices = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.ingredientId, ingredientId))
    .groupBy(priceHistory.supplierId)
    .orderBy(desc(priceHistory.recordedAt));
  
  if (recentPrices.length === 0) {
    throw new Error('No supplier prices found');
  }
  
  // Find lowest price
  const bestSupplier = recentPrices.reduce((best, current) => 
    current.price < best.price ? current : best
  );
  
  // Calculate potential savings vs current supplier
  const currentIngredient = await getIngredientById(ingredientId);
  const savings = currentIngredient.currentPrice - bestSupplier.price;
  
  return {
    supplierId: bestSupplier.supplierId!,
    price: bestSupplier.price,
    savings,
  };
}
```

## Validation Schemas

Always validate inputs using Zod:

```typescript
import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  category: z.enum(['protein', 'vegetable', 'dairy', 'spice', 'grain', 'other']),
  unitOfMeasure: z.enum(['kg', 'g', 'l', 'ml', 'piece']),
  currentPrice: z.number().positive('Price must be positive'),
  pricePerUnit: z.number().positive(),
  currentStock: z.number().nonnegative().default(0),
  minStockLevel: z.number().nonnegative().optional(),
  supplierId: z.number().int().positive().optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['appetizer', 'main', 'dessert', 'beverage', 'side']),
  servings: z.number().int().positive(),
  sellingPrice: z.number().positive().optional(),
  targetCostPercentage: z.number().min(10).max(80).default(32),
});

export const recipeIngredientSchema = z.object({
  recipeId: z.number().int().positive(),
  ingredientId: z.number().int().positive(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});
```

## Error Handling Best Practices

```typescript
class RecipeCostingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'RecipeCostingError';
  }
}

// Usage
function calculateRecipeCost(ingredients: RecipeIngredient[]): number {
  if (ingredients.length === 0) {
    throw new RecipeCostingError(
      'Recipe must have at least one ingredient',
      'EMPTY_RECIPE'
    );
  }
  
  try {
    return ingredients.reduce((total, item) => {
      if (item.ingredient.pricePerUnit <= 0) {
        throw new RecipeCostingError(
          `Invalid price for ${item.ingredient.name}`,
          'INVALID_PRICE'
        );
      }
      
      const cost = item.quantity * item.ingredient.pricePerUnit;
      return total + cost;
    }, 0);
  } catch (error) {
    if (error instanceof RecipeCostingError) {
      throw error;
    }
    throw new RecipeCostingError('Failed to calculate recipe cost', 'CALCULATION_ERROR');
  }
}
```

## Performance Optimization Tips

1. **Cache Calculated Costs:**
   ```typescript
   // Store in recipe table, update only when ingredients/prices change
   await db.update(recipes)
     .set({ totalCost: calculatedCost, updatedAt: new Date() })
     .where(eq(recipes.id, recipeId));
   ```

2. **Batch Price Updates:**
   ```typescript
   // Update multiple ingredients at once
   await db.transaction(async (tx) => {
     for (const update of priceUpdates) {
       await tx.update(ingredients)
         .set({ currentPrice: update.price })
         .where(eq(ingredients.id, update.id));
     }
   });
   ```

3. **Use Database Indexes:**
   ```typescript
   // In schema definition
   createIndex('idx_recipe_ingredients_recipe').on(recipeIngredients.recipeId);
   createIndex('idx_price_history_ingredient').on(priceHistory.ingredientId);
   ```

## Testing Checklist

When implementing recipe costing, ensure tests cover:

- [ ] Basic recipe cost calculation
- [ ] Unit conversions (kg ↔ g, L ↔ mL)
- [ ] Food cost percentage calculation
- [ ] Profit margin calculation
- [ ] Handling zero/negative prices (should error)
- [ ] Handling missing ingredients
- [ ] Inventory stock updates (purchase/usage)
- [ ] Low stock alerts
- [ ] Price history recording
- [ ] Recipe cost recalculation on price change
- [ ] Supplier price comparison

## Common Pitfalls to Avoid

1. **❌ Storing prices as floats** → Use integers (cents) to avoid rounding errors
2. **❌ Not normalizing units** → Always convert to base unit before calculations
3. **❌ Ignoring transaction safety** → Use database transactions for multi-table updates
4. **❌ Hardcoded conversion factors** → Make them configurable
5. **❌ Not validating inputs** → Use Zod schemas strictly
6. **❌ Calculating costs in UI layer** → Keep business logic in services
7. **❌ Forgetting to update recipe costs** → Trigger recalculation on price changes

## Integration with UI

**Display Helper Functions:**

```typescript
/**
 * Format currency for display
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage for display
 */
function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get food cost status (visual indicator)
 */
function getFoodCostStatus(percentage: number): 'excellent' | 'good' | 'warning' | 'danger' {
  if (percentage <= 28) return 'excellent';
  if (percentage <= 35) return 'good';
  if (percentage <= 40) return 'warning';
  return 'danger';
}
```

## References

- [Restaurant Food Cost Percentage](https://www.webstaurantstore.com/article/129/restaurant-food-cost.html)
- [Economic Order Quantity](https://en.wikipedia.org/wiki/Economic_order_quantity)
- [Unit Conversion Standards](https://www.nist.gov/pml/weights-and-measures)

---

**Always reference this skill when implementing cost calculations to ensure accuracy and consistency.**
