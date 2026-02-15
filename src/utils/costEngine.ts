import { convertUnit } from "./conversions";
import { convertCurrency } from "./currencyConverter";

export class CostingError extends Error {
  constructor(
    message: string,
    public code: string = "COSTING_ERROR",
  ) {
    super(message);
    this.name = "CostingError";
  }
}

export class CircularReferenceError extends CostingError {
  constructor(recipeName: string) {
    super(
      `Circular reference detected: Recipe "${recipeName}" refers back to itself through sub-recipes.`,
      "CIRCULAR_REFERENCE",
    );
    this.name = "CircularReferenceError";
  }
}

interface RecipeItemCost {
  cost: number;
  error?: string;
  errorCode?: string;
}

/**
 * A utility to track visited recipes during recursive costing to prevent infinite loops.
 */
export class CostingCycleGuard {
  private readonly visited = new Set<number>();

  constructor(initialIds: number[] = []) {
    for (const id of initialIds) {
      this.visited.add(id);
    }
  }

  /**
   * Records a recipe as visited and throws if a cycle is detected.
   */
  enter(id: number, name: string) {
    if (this.visited.has(id)) {
      throw new CircularReferenceError(name);
    }
    this.visited.add(id);
  }

  /**
   * Removes a recipe from the visited set (useful for DAG traversal where a recipe can be reached via multiple paths but not cycles).
   */
  exit(id: number) {
    this.visited.delete(id);
  }

  /**
   * Returns a copy of the guard with current state.
   */
  clone() {
    return new CostingCycleGuard(Array.from(this.visited));
  }
}

interface CostInputItem {
  name: string;
  quantity: number;
  unit: string; // Unit used in recipe
  currentPricePerUnit: number; // Price of the ingredient
  ingredientUnit: string; // Unit the ingredient is priced in
  currency: string;
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

export async function calculateRecipeTotal(
  items: CostInputItem[],
  wasteBuffer = 0,
  recipeCurrency = "USD",
  guard?: CostingCycleGuard,
  currentRecipeInfo?: { id: number; name: string },
) {
  if (guard && currentRecipeInfo) {
    guard.enter(currentRecipeInfo.id, currentRecipeInfo.name);
  }

  let subtotal = 0;
  const errors: string[] = [];

  /*
   * PARALLEL EXECUTION:
   * We map over items to initiate all async conversions simultaneously.
   * Then we wait for all to complete using Promise.all.
   */
  const results = await Promise.all(
    items.map(async (item) => {
      const result = calculateIngredientCost(
        item.quantity,
        item.unit,
        item.currentPricePerUnit,
        item.ingredientUnit,
      );

      if (result.error) {
        return { cost: 0, error: `${item.name}: ${result.error}` };
      }

      // Convert ingredient cost to recipe currency
      const conversion = await convertCurrency(
        result.cost,
        item.currency || "USD",
        recipeCurrency,
      );

      if (conversion.error) {
        return {
          cost: conversion.converted,
          error: `${item.name}: ${conversion.error}`,
        };
      }

      return { cost: conversion.converted };
    }),
  );

  // Aggregate results
  for (const res of results) {
    subtotal += res.cost;
    if (res.error) {
      errors.push(res.error);
    }
  }

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

/**
 * Calculates the new weighted average price when adding new stock at a different price.
 * Method: Weighted Average Cost (WAC)
 * Formula: ((Old Stock * Old Price) + (New Stock * New Price)) / (Total Stock)
 */
export function calculateWeightedAverage(
  currentStock: number,
  currentPrice: number,
  addedStock: number,
  addedPrice: number,
): number {
  const totalStock = currentStock + addedStock;
  if (totalStock <= 0) return 0;

  const totalValue = currentStock * currentPrice + addedStock * addedPrice;
  return totalValue / totalStock;
}
