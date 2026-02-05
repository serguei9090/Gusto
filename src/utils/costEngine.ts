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
    baseUnit: string
): RecipeItemCost {
    try {
        const convertedQuantity = convertUnit(quantity, usedUnit, baseUnit);
        return { cost: convertedQuantity * basePrice };
    } catch (e) {
        return { cost: 0, error: (e as Error).message };
    }
}

export function calculateRecipeTotal(items: CostInputItem[]) {
    let totalCost = 0;
    const errors: string[] = [];

    items.forEach(item => {
        const result = calculateIngredientCost(
            item.quantity,
            item.unit,
            item.currentPricePerUnit,
            item.ingredientUnit
        );

        if (result.error) {
            errors.push(`${item.name}: ${result.error}`);
        } else {
            totalCost += result.cost;
        }
    });

    return { totalCost, errors };
}

/**
 * Calculates Profit Margin Percentage.
 * Formula: ((Selling Price - Cost) / Selling Price) * 100
 */
export function calculateProfitMargin(cost: number, sellingPrice: number): number {
    if (sellingPrice <= 0) return 0;
    return ((sellingPrice - cost) / sellingPrice) * 100;
}

/**
 * Calculates Suggested Selling Price based on Target Margin.
 * Formula: Cost / (1 - Margin%)
 */
export function calculateSuggestedPrice(cost: number, targetMarginPercent: number): number {
    if (targetMarginPercent >= 100 || targetMarginPercent < 0) return 0;
    const marginDecimal = targetMarginPercent / 100;
    const price = cost / (1 - marginDecimal);
    return Math.round(price * 100) / 100; // Round to 2 decimals
}
