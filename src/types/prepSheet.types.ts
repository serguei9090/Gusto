/**
 * Prep Sheet Types
 * For kitchen production planning and ingredient aggregation
 */

/** Single ingredient line on a prep sheet */
export interface PrepSheetItem {
    ingredientId: number;
    ingredientName: string;
    totalQuantity: number;
    unit: string;
    /** Which recipes contributed to this total */
    recipeBreakdown: { recipeName: string; qty: number }[];
}

/** Recipe selection for prep sheet generation */
export interface PrepSheetRecipe {
    recipeId: number;
    recipeName: string;
    baseServings: number;
    requestedServings: number;
}

/** Full prep sheet document */
export interface PrepSheet {
    id?: number;
    name: string;
    date: string;
    shift?: "AM" | "PM" | "Full Day";
    prepCookName?: string;
    notes?: string;
    items: PrepSheetItem[];
    recipes: PrepSheetRecipe[];
    createdAt: string;
}

/** Form data for prep sheet builder */
export interface PrepSheetFormData {
    name: string;
    date: string;
    shift?: "AM" | "PM" | "Full Day";
    prepCookName?: string;
    notes?: string;
    recipeSelections: { recipeId: number; servings: number }[];
}
