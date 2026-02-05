import { getDatabase } from "./database/client";
import type {
    Recipe,
    CreateRecipeInput,
    UpdateRecipeInput,
    RecipeWithIngredients,
    RecipeIngredient
} from "@/types/ingredient.types";
import { calculateRecipeTotal, calculateProfitMargin } from "@/utils/costEngine";

class RecipesService {
    async getAll(): Promise<Recipe[]> {
        const db = await getDatabase();
        return db.select<Recipe[]>("SELECT * FROM recipes ORDER BY name");
    }

    async create(data: CreateRecipeInput): Promise<Recipe> {
        const db = await getDatabase();
        const result = await db.execute(
            `INSERT INTO recipes (name, description, category, servings, prep_time_minutes, cooking_instructions, selling_price, target_cost_percentage) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                data.name,
                data.description || null,
                data.category || null,
                data.servings,
                data.prepTimeMinutes || null,
                data.cookingInstructions || null,
                data.sellingPrice || null,
                data.targetCostPercentage || null
            ]
        );

        const created = await db.select<Recipe[]>(
            "SELECT * FROM recipes WHERE id = $1",
            [result.lastInsertId]
        );
        return created[0];
    }

    async createFull(data: CreateRecipeInput & { ingredients: { ingredientId: number, quantity: number, unit: string }[] }): Promise<Recipe> {
        const recipe = await this.create(data);
        for (const ing of data.ingredients) {
            await this.addIngredient(recipe.id, ing.ingredientId, ing.quantity, ing.unit);
        }
        return recipe;
    }

    async getById(id: number): Promise<RecipeWithIngredients | null> {
        const db = await getDatabase();
        const recipes = await db.select<Recipe[]>("SELECT * FROM recipes WHERE id = $1", [id]);
        if (!recipes.length) return null;

        // Use camelCase aliases to match Typescript interface
        const ingredients = await db.select<(RecipeIngredient & { ingredientName: string, currentPricePerUnit: number, ingredientUnit: any })[]>(
            `SELECT 
                ri.id,
                ri.recipe_id as recipeId,
                ri.ingredient_id as ingredientId,
                ri.quantity,
                ri.unit,
                ri.cost,
                ri.notes,
                i.name as ingredientName,
                i.price_per_unit as currentPricePerUnit,
                i.unit_of_measure as ingredientUnit
             FROM recipe_ingredients ri
             JOIN ingredients i ON ri.ingredient_id = i.id
             WHERE ri.recipe_id = $1`,
            [id]
        );

        return {
            ...recipes[0],
            ingredients
        };
    }

    async addIngredient(recipeId: number, ingredientId: number, quantity: number, unit: string): Promise<void> {
        const db = await getDatabase();
        await db.execute(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4)`,
            [recipeId, ingredientId, quantity, unit]
        );
        await this.recalculateCosts(recipeId);
    }

    async removeIngredient(recipeIngredientId: number, recipeId: number): Promise<void> {
        const db = await getDatabase();
        await db.execute("DELETE FROM recipe_ingredients WHERE id = $1", [recipeIngredientId]);
        await this.recalculateCosts(recipeId);
    }

    async updateIngredient(recipeIngredientId: number, recipeId: number, quantity: number, unit: string): Promise<void> {
        const db = await getDatabase();
        await db.execute(
            "UPDATE recipe_ingredients SET quantity = $1, unit = $2 WHERE id = $3",
            [quantity, unit, recipeIngredientId]
        );
        await this.recalculateCosts(recipeId);
    }

    async update(id: number, data: UpdateRecipeInput): Promise<void> {
        const db = await getDatabase();

        const sets: string[] = [];
        const values: any[] = [];
        let counter = 1;

        if (data.name !== undefined) { sets.push(`name = $${counter++}`); values.push(data.name); }
        if (data.description !== undefined) { sets.push(`description = $${counter++}`); values.push(data.description); }
        if (data.category !== undefined) { sets.push(`category = $${counter++}`); values.push(data.category); }
        if (data.servings !== undefined) { sets.push(`servings = $${counter++}`); values.push(data.servings); }
        if (data.prepTimeMinutes !== undefined) { sets.push(`prep_time_minutes = $${counter++}`); values.push(data.prepTimeMinutes); }
        if (data.cookingInstructions !== undefined) { sets.push(`cooking_instructions = $${counter++}`); values.push(data.cookingInstructions); }
        if (data.sellingPrice !== undefined) { sets.push(`selling_price = $${counter++}`); values.push(data.sellingPrice); }
        if (data.targetCostPercentage !== undefined) { sets.push(`target_cost_percentage = $${counter++}`); values.push(data.targetCostPercentage); }

        if (sets.length === 0) return;

        values.push(id);
        const query = `UPDATE recipes SET ${sets.join(", ")} WHERE id = $${counter}`;
        await db.execute(query, values);

        // Recalculate if price changed (affects margin) or servings changed (might affect cost per serving if implemented)
        if (data.sellingPrice !== undefined || data.servings !== undefined) {
            await this.recalculateCosts(id);
        }
    }

    async delete(id: number): Promise<void> {
        const db = await getDatabase();
        // recipe_ingredients should cascade delete due to schema FK
        await db.execute("DELETE FROM recipes WHERE id = $1", [id]);
    }

    /**
     * Core Logic: Recalculates total cost and profit margin for a recipe.
     */
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
        const db = await getDatabase();
        await db.execute(
            "UPDATE recipes SET total_cost = $1, profit_margin = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
            [totalCost, profitMargin, recipeId]
        );
    }
}

export const recipesService = new RecipesService();
