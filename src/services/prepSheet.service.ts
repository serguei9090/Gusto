import { getDatabase } from "./database/client";
import { recipesService } from "./recipes.service";
import type { PrepSheet, PrepSheetItem, PrepSheetRecipe, PrepSheetFormData } from "@/types/prepSheet.types";
import { convertUnit } from "@/utils/conversions";

/**
 * Prep Sheet Service
 * Generates aggregated ingredient lists from recipe selections
 */
class PrepSheetService {
    /**
     * Generate a prep sheet from recipe selections
     * Aggregates ingredients across all selected recipes
     */
    async generate(formData: PrepSheetFormData): Promise<PrepSheet> {
        const recipeSelections: PrepSheetRecipe[] = [];
        const ingredientMap = new Map<number, PrepSheetItem>();

        for (const selection of formData.recipeSelections) {
            const recipe = await recipesService.getById(selection.recipeId);
            if (!recipe) continue;

            const scaleFactor = selection.servings / recipe.servings;

            recipeSelections.push({
                recipeId: recipe.id,
                recipeName: recipe.name,
                baseServings: recipe.servings,
                requestedServings: selection.servings
            });

            // Aggregate ingredients
            for (const ing of recipe.ingredients) {
                const scaledQty = ing.quantity * scaleFactor;
                const existing = ingredientMap.get(ing.ingredientId);

                if (existing) {
                    // Try to convert to existing unit
                    try {
                        const converted = convertUnit(scaledQty, ing.unit, existing.unit);
                        existing.totalQuantity += converted;
                        existing.recipeBreakdown.push({
                            recipeName: recipe.name,
                            qty: scaledQty
                        });
                    } catch {
                        // Different unit types - add as separate breakdown entry
                        existing.recipeBreakdown.push({
                            recipeName: `${recipe.name} (${ing.unit})`,
                            qty: scaledQty
                        });
                    }
                } else {
                    ingredientMap.set(ing.ingredientId, {
                        ingredientId: ing.ingredientId,
                        ingredientName: ing.ingredientName,
                        totalQuantity: scaledQty,
                        unit: ing.unit,
                        recipeBreakdown: [{
                            recipeName: recipe.name,
                            qty: scaledQty
                        }]
                    });
                }
            }
        }

        return {
            name: formData.name,
            date: formData.date,
            shift: formData.shift,
            prepCookName: formData.prepCookName,
            notes: formData.notes,
            items: Array.from(ingredientMap.values()).sort((a, b) =>
                a.ingredientName.localeCompare(b.ingredientName)
            ),
            recipes: recipeSelections,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Save a prep sheet to the database for future reference
     */
    async save(sheet: PrepSheet): Promise<number> {
        const db = await getDatabase();
        const result = await db.execute(
            `INSERT INTO prep_sheets (name, date, shift, prep_cook_name, notes, recipes_json, items_json)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                sheet.name,
                sheet.date,
                sheet.shift || null,
                sheet.prepCookName || null,
                sheet.notes || null,
                JSON.stringify(sheet.recipes),
                JSON.stringify(sheet.items)
            ]
        );
        return result.lastInsertId as number;
    }

    /**
     * Get all saved prep sheets
     */
    async getAll(): Promise<PrepSheet[]> {
        const db = await getDatabase();
        const rows = await db.select<{
            id: number;
            name: string;
            date: string;
            shift: string | null;
            prep_cook_name: string | null;
            notes: string | null;
            recipes_json: string;
            items_json: string;
            created_at: string;
        }[]>("SELECT * FROM prep_sheets ORDER BY date DESC, created_at DESC");

        return rows.map(row => ({
            id: row.id,
            name: row.name,
            date: row.date,
            shift: row.shift as PrepSheet["shift"],
            prepCookName: row.prep_cook_name || undefined,
            notes: row.notes || undefined,
            recipes: JSON.parse(row.recipes_json),
            items: JSON.parse(row.items_json),
            createdAt: row.created_at
        }));
    }

    /**
     * Get a single prep sheet by ID
     */
    async getById(id: number): Promise<PrepSheet | null> {
        const db = await getDatabase();
        const rows = await db.select<{
            id: number;
            name: string;
            date: string;
            shift: string | null;
            prep_cook_name: string | null;
            notes: string | null;
            recipes_json: string;
            items_json: string;
            created_at: string;
        }[]>("SELECT * FROM prep_sheets WHERE id = $1", [id]);

        if (!rows.length) return null;

        const row = rows[0];
        return {
            id: row.id,
            name: row.name,
            date: row.date,
            shift: row.shift as PrepSheet["shift"],
            prepCookName: row.prep_cook_name || undefined,
            notes: row.notes || undefined,
            recipes: JSON.parse(row.recipes_json),
            items: JSON.parse(row.items_json),
            createdAt: row.created_at
        };
    }

    /**
     * Delete a saved prep sheet
     */
    async delete(id: number): Promise<void> {
        const db = await getDatabase();
        await db.execute("DELETE FROM prep_sheets WHERE id = $1", [id]);
    }
}

export const prepSheetService = new PrepSheetService();
