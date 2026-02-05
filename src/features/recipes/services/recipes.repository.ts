import { db } from "@/lib/db";
import type {
    Recipe,
    CreateRecipeInput,
    UpdateRecipeInput,
    RecipeWithIngredients,
    RecipeIngredient
} from "@/types/ingredient.types";
import { calculateRecipeTotal, calculateProfitMargin } from "@/utils/costEngine";
import { sql } from "kysely";

export class RecipesRepository {
    async getAll(): Promise<Recipe[]> {
        return await db.selectFrom("recipes")
            .selectAll()
            .orderBy("name")
            .execute();
    }

    async getById(id: number): Promise<RecipeWithIngredients | null> {
        const recipe = await db.selectFrom("recipes")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();

        if (!recipe) return null;

        // Join to get full ingredient details
        const ingredients = await db.selectFrom("recipe_ingredients as ri")
            .innerJoin("ingredients as i", "ri.ingredient_id", "i.id")
            .select([
                "ri.id",
                "ri.recipe_id as recipeId",
                "ri.ingredient_id as ingredientId",
                "ri.quantity",
                "ri.unit",
                "ri.cost",
                "ri.notes",
                "i.name as ingredientName",
                "i.price_per_unit as currentPricePerUnit",
                "i.unit_of_measure as ingredientUnit"
            ])
            .where("ri.recipe_id", "=", id)
            .execute();

        return {
            ...recipe,
            ingredients: ingredients.map(ing => ({
                ...ing,
                // Kysely types might be slightly different than raw SQL result, ensure consistency
                ingredientUnit: ing.ingredientUnit as any
            }))
        };
    }

    async create(data: CreateRecipeInput): Promise<Recipe> {
        const result = await db.insertInto("recipes")
            .values({
                name: data.name,
                description: data.description || null,
                category: data.category || null,
                servings: data.servings,
                prep_time_minutes: data.prepTimeMinutes || null,
                cooking_instructions: data.cookingInstructions || null,
                selling_price: data.sellingPrice || null,
                target_cost_percentage: data.targetCostPercentage || null
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return result;
    }

    async createFull(data: CreateRecipeInput & { ingredients: { ingredientId: number, quantity: number, unit: string }[] }): Promise<Recipe> {
        // Transaction manually handled if we want atomicity, but for now we follow the pattern
        const recipe = await this.create(data);

        for (const ing of data.ingredients) {
            await this.addIngredient(recipe.id, ing.ingredientId, ing.quantity, ing.unit);
        }

        // Return potentially updated recipe (if costs calculated)
        const updated = await this.getById(recipe.id);
        return updated!;
    }

    async update(id: number, data: UpdateRecipeInput): Promise<void> {
        if (Object.keys(data).length === 0) return;

        await db.updateTable("recipes")
            .set({
                name: data.name,
                description: data.description,
                category: data.category,
                servings: data.servings,
                prep_time_minutes: data.prepTimeMinutes,
                cooking_instructions: data.cookingInstructions,
                selling_price: data.sellingPrice,
                target_cost_percentage: data.targetCostPercentage,
                updated_at: sql`CURRENT_TIMESTAMP`
            })
            .where("id", "=", id)
            .execute();

        if (data.sellingPrice !== undefined || data.servings !== undefined) {
            await this.recalculateCosts(id);
        }
    }

    async delete(id: number): Promise<void> {
        await db.deleteFrom("recipes")
            .where("id", "=", id)
            .execute();
    }

    // --- Ingredient Management ---

    async addIngredient(recipeId: number, ingredientId: number, quantity: number, unit: string): Promise<void> {
        await db.insertInto("recipe_ingredients")
            .values({
                recipe_id: recipeId,
                ingredient_id: ingredientId,
                quantity,
                unit
            })
            .execute();

        await this.recalculateCosts(recipeId);
    }

    async removeIngredient(recipeIngredientId: number, recipeId: number): Promise<void> {
        await db.deleteFrom("recipe_ingredients")
            .where("id", "=", recipeIngredientId)
            .execute();

        await this.recalculateCosts(recipeId);
    }

    async updateIngredient(recipeIngredientId: number, recipeId: number, quantity: number, unit: string): Promise<void> {
        await db.updateTable("recipe_ingredients")
            .set({
                quantity,
                unit
            })
            .where("id", "=", recipeIngredientId)
            .execute();

        await this.recalculateCosts(recipeId);
    }

    async recalculateCosts(recipeId: number): Promise<void> {
        const recipe = await this.getById(recipeId);
        if (!recipe) return;

        // 1. Calculate Cost
        const { totalCost } = calculateRecipeTotal(recipe.ingredients.map(i => ({
            name: i.ingredientName,
            quantity: i.quantity,
            unit: i.unit,
            currentPricePerUnit: i.currentPricePerUnit,
            ingredientUnit: i.ingredientUnit as string
        })));

        // 2. Calculate Margin
        const sellingPrice = recipe.sellingPrice || 0;
        const profitMargin = calculateProfitMargin(totalCost, sellingPrice);

        // 3. Update DB
        await db.updateTable("recipes")
            .set({
                total_cost: totalCost,
                profit_margin: profitMargin,
                updated_at: sql`CURRENT_TIMESTAMP`
            })
            .where("id", "=", recipeId)
            .execute();
    }
}

export const recipesRepository = new RecipesRepository();
