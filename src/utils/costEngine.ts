import { convertUnit } from "./conversions";

interface RecipeItemCost {
  cost: number;
  error?: string;
}

interface CostInputItem {
  name: string;
  quantity: number;
  unit: string; // Unit used in recipe
  currentPricePerUnit: number; // Price of the ingredient
  ingredientUnit: string; // Unit the ingredient is priced in
}

export function calculateIngredientCost(
  quantity: number,
  usedUnit: string,
  basePrice: number,
  baseUnit: string,
): RecipeItemCost {
  try {
    const convertedQuantity = convertUnit(quantity, usedUnit, baseUnit);
    return { cost: convertedQuantity * basePrice };
  } catch (e) {
    return { cost: 0, error: (e as Error).message };
  }
}

import { type Currency } from "./currency";

// ... previous interfaces...

export function calculateRecipeTotal(
  items: CostInputItem[],
  wasteBuffer = 0,
  _recipeCurrency: Currency = "USD",
  _exchangeRates?: Record<string, number>
) {
  let subtotal = 0;
  const errors: string[] = [];

  items.forEach((item) => {
    const result = calculateIngredientCost(
      item.quantity,
      item.unit,
      item.currentPricePerUnit,
      item.ingredientUnit,
    );

    if (result.error) {
      errors.push(`${item.name}: ${result.error}`);
    } else {
      subtotal += result.cost;
    }
  });

  const wasteCost = (subtotal * wasteBuffer) / 100;
  const totalCost = subtotal + wasteCost;

  return { subtotal, wasteCost, totalCost, errors };
}

/**
 * Calculates Profit Margin Percentage (Gross Profit / Selling Price).
 * Formula: ((Selling Price - Cost) / Selling Price) * 100
 */
export function calculateProfitMargin(
  cost: number,
  sellingPrice: number,
): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

/**
 * Calculates Food Cost Percentage (Cost / Selling Price).
 * Formula: (Cost / Selling Price) * 100
 */
export function calculateFoodCostPercentage(
  cost: number,
  sellingPrice: number,
): number {
  if (sellingPrice <= 0) return 0;
  return (cost / sellingPrice) * 100;
}

/**
 * Calculates Suggested Selling Price based on Target Food Cost %.
 * Formula: Cost / (TargetCost% / 100)
 */
export function calculateSuggestedPrice(
  cost: number,
  targetCostPercentage: number,
): number {
  if (targetCostPercentage <= 0) return 0;
  const targetDecimal = targetCostPercentage / 100;
  const price = cost / targetDecimal;
  return Math.round(price * 100) / 100; // Round to 2 decimals
}
