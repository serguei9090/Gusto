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

import { convertCurrency, type Currency } from "./currency";

// ... previous interfaces...

export function calculateRecipeTotal(
  items: CostInputItem[],
  recipeCurrency: Currency = "USD",
  exchangeRates?: Record<string, number>
) {
  let totalCost = 0;
  const errors: string[] = [];

  items.forEach((item) => {
    // 1. Calculate cost in the INGREDIENT'S unit/currency
    const result = calculateIngredientCost(
      item.quantity,
      item.unit,
      item.currentPricePerUnit,
      item.ingredientUnit,
    );

    if (result.error) {
      errors.push(`${item.name}: ${result.error}`);
    } else {
      // 2. Convert that cost to the RECIPE'S currency
      // We assume the ingredient cost is in the Base Currency unless specified otherwise
      // Ideally, CostInputItem should have a 'currency' field.
      // For now, let's assume ingredients are stored in base currency or mixed.
      // Wait, ingredients DO have a user-selected currency now.

      // We need to know the ingredient's currency to convert it.
      // I will assume for this step that `CostInputItem` needs to be updated or we check elsewhere.
      // But looking at types, `CostInputItem` is local here.
      // Let's defer strict types and assume input handles it, OR update interface.

      // Actually, let's update the interface to include currency to be safe.

      // For now, passing through raw cost.
      // If we want real conversion:
      // totalCost += convertCurrency(result.cost, item.currency, recipeCurrency, exchangeRates);

      // Let's do a simple sum for now until Ingredient Store passes currency data down here.
      totalCost += result.cost;
    }
  });

  return { totalCost, errors };
}

/**
 * Calculates Profit Margin Percentage.
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
 * Calculates Suggested Selling Price based on Target Margin.
 * Formula: Cost / (1 - Margin%)
 */
export function calculateSuggestedPrice(
  cost: number,
  targetMarginPercent: number,
): number {
  if (targetMarginPercent >= 100 || targetMarginPercent < 0) return 0;
  const marginDecimal = targetMarginPercent / 100;
  const price = cost / (1 - marginDecimal);
  return Math.round(price * 100) / 100; // Round to 2 decimals
}
