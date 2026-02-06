import type { Insertable, Selectable } from "kysely";
import type {
  PrepSheet,
  PrepSheetFormData,
  PrepSheetItem,
  PrepSheetRecipe,
} from "@/features/prep-sheets/types";
import { recipesRepository } from "@/features/recipes/services/recipes.repository";
import { db } from "@/lib/db";
import type { PrepSheetsTable } from "@/types/db.types";
import { convertUnit } from "@/utils/conversions";

export type CreatePrepSheetInput = Insertable<PrepSheetsTable>;

class PrepSheetsRepository {
  /**
   * Generate a prep sheet from recipe selections (In-Memory Aggregation)
   */
  async generate(formData: PrepSheetFormData): Promise<PrepSheet> {
    const recipeSelections: PrepSheetRecipe[] = [];
    const ingredientMap = new Map<number, PrepSheetItem>();

    for (const selection of formData.recipeSelections) {
      const recipe = await recipesRepository.getById(selection.recipeId);
      if (!recipe) continue;

      const scaleFactor = selection.servings / recipe.servings;

      recipeSelections.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        baseServings: recipe.servings,
        requestedServings: selection.servings,
      });

      // Aggregate ingredients
      for (const ing of recipe.ingredients) {
        const scaledQty = ing.quantity * scaleFactor;
        const existing = ingredientMap.get(ing.ingredientId);

        if (existing) {
          try {
            // Try to convert to existing unit
            const converted = convertUnit(scaledQty, ing.unit, existing.unit);
            existing.totalQuantity += converted;
            existing.recipeBreakdown.push({
              recipeName: recipe.name,
              qty: scaledQty,
            });
          } catch {
            existing.recipeBreakdown.push({
              recipeName: `${recipe.name} (${ing.unit})`,
              qty: scaledQty,
            });
          }
        } else {
          ingredientMap.set(ing.ingredientId, {
            ingredientId: ing.ingredientId,
            ingredientName: ing.ingredientName || "Unknown Ingredient",
            totalQuantity: scaledQty,
            unit: ing.unit,
            recipeBreakdown: [
              {
                recipeName: recipe.name,
                qty: scaledQty,
              },
            ],
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
        a.ingredientName.localeCompare(b.ingredientName),
      ),
      recipes: recipeSelections,
      createdAt: new Date().toISOString(),
    };
  }

  async getAll(): Promise<PrepSheet[]> {
    const rows = await db
      .selectFrom("prep_sheets")
      .selectAll()
      .orderBy("date", "desc")
      .orderBy("created_at", "desc")
      .execute();

    return rows.map(this.mapToDomain);
  }

  async getById(id: number): Promise<PrepSheet | null> {
    const row = await db
      .selectFrom("prep_sheets")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return row ? this.mapToDomain(row) : null;
  }

  async delete(id: number): Promise<void> {
    await db.deleteFrom("prep_sheets").where("id", "=", id).execute();
  }

  async save(sheet: PrepSheet): Promise<number> {
    const result = await db
      .insertInto("prep_sheets")
      .values({
        name: sheet.name,
        date: sheet.date,
        shift: sheet.shift || null,
        prep_cook_name: sheet.prepCookName || null,
        notes: sheet.notes || null,
        recipes_json: JSON.stringify(sheet.recipes),
        items_json: JSON.stringify(sheet.items),
      })
      .executeTakeFirstOrThrow();

    // SQLite/Tauri compat
    return Number(result.insertId);
  }

  private mapToDomain(row: Selectable<PrepSheetsTable>): PrepSheet {
    return {
      id: row.id,
      name: row.name,
      date: row.date,
      shift: (row.shift as "morning" | "evening") || null,
      prepCookName: row.prep_cook_name || undefined,
      notes: row.notes || undefined,
      recipes: JSON.parse(row.recipes_json),
      items: JSON.parse(row.items_json),
      createdAt: row.created_at || new Date().toISOString(),
    };
  }
}

export const prepSheetsRepository = new PrepSheetsRepository();
