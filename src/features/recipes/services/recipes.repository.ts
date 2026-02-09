import type { Selectable } from "kysely";
import { sql } from "kysely";
import { db } from "@/lib/db";
import type { RecipesTable } from "@/types/db.types";
import type {
  CreateRecipeInput,
  Recipe,
  RecipeCategory,
  RecipeWithIngredients,
  UnitOfMeasure,
  UpdateRecipeInput,
} from "@/types/ingredient.types";
import type { Currency } from "@/utils/currency";

export type RecipeRow = Selectable<RecipesTable>;
export interface JoinedRecipeIngredientRow {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  cost: number | null;
  notes: string | null;
  ingredientName: string;
  currentPricePerUnit: number;
  ingredientUnit: string;
  currency: string;
}

import {
  calculateProfitMargin,
  calculateRecipeTotal,
  calculateSuggestedPrice,
} from "@/utils/costEngine";

export class RecipesRepository {
  async getAll(): Promise<Recipe[]> {
    const rows = await db
      .selectFrom("recipes")
      .selectAll()
      .orderBy("name")
      .execute();
    return rows.map(this.mapRowToRecipe);
  }

  async getById(id: number): Promise<RecipeWithIngredients | null> {
    const recipeRow = await db
      .selectFrom("recipes")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!recipeRow) return null;

    const recipe = this.mapRowToRecipe(recipeRow);

    // Join to get full ingredient details
    const ingredients = await db
      .selectFrom("recipe_ingredients as ri")
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
        "i.unit_of_measure as ingredientUnit",
        "i.currency",
      ])
      .where("ri.recipe_id", "=", id)
      .execute();

    return {
      ...recipe,
      ingredients: ingredients.map((ing: JoinedRecipeIngredientRow) => ({
        ...ing,
        ingredientUnit: ing.ingredientUnit as UnitOfMeasure,
      })),
    };
  }

  async create(data: CreateRecipeInput): Promise<Recipe> {
    const result = await db
      .insertInto("recipes")
      .values({
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        servings: data.servings,
        prep_time_minutes: data.prepTimeMinutes || null,
        cooking_instructions: data.cookingInstructions || null,
        selling_price: data.sellingPrice || null,
        currency: "USD", // Default if not provided
        target_cost_percentage: data.targetCostPercentage || null,
        waste_buffer_percentage: data.wasteBufferPercentage || null,
        is_experiment: 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapRowToRecipe(result);
  }

  async createFull(
    data: CreateRecipeInput & {
      ingredients: { ingredientId: number; quantity: number; unit: string }[];
    },
  ): Promise<Recipe> {
    // Transaction manually handled if we want atomicity, but for now we follow the pattern
    const recipe = await this.create(data);

    for (const ing of data.ingredients) {
      await this.addIngredient(
        recipe.id,
        ing.ingredientId,
        ing.quantity,
        ing.unit,
      );
    }

    // Return potentially updated recipe (if costs calculated)
    const updated = await this.getById(recipe.id);
    // biome-ignore lint/style/noNonNullAssertion: Updated recipe exists
    return updated!;
  }

  async update(id: number, data: UpdateRecipeInput): Promise<void> {
    if (Object.keys(data).length === 0) return;

    await db
      .updateTable("recipes")
      .set({
        name: data.name,
        description: data.description,
        category: data.category,
        servings: data.servings,
        prep_time_minutes: data.prepTimeMinutes,
        cooking_instructions: data.cookingInstructions,
        selling_price: data.sellingPrice,
        target_cost_percentage: data.targetCostPercentage,
        waste_buffer_percentage: data.wasteBufferPercentage,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", id)
      .execute();

    if (data.ingredients) {
      // Replace all ingredients
      await db
        .deleteFrom("recipe_ingredients")
        .where("recipe_id", "=", id)
        .execute();

      if (data.ingredients.length > 0) {
        await db
          .insertInto("recipe_ingredients")
          .values(
            data.ingredients.map((ing) => ({
              recipe_id: id,
              ingredient_id: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          )
          .execute();
      }
    }

    if (
      data.sellingPrice !== undefined ||
      data.servings !== undefined ||
      data.targetCostPercentage !== undefined ||
      data.wasteBufferPercentage !== undefined ||
      data.ingredients !== undefined
    ) {
      await this.recalculateCosts(id);
    }
  }

  async delete(id: number): Promise<void> {
    await db.deleteFrom("recipes").where("id", "=", id).execute();
  }

  // --- Ingredient Management ---

  async addIngredient(
    recipeId: number,
    ingredientId: number,
    quantity: number,
    unit: string,
  ): Promise<void> {
    await db
      .insertInto("recipe_ingredients")
      .values({
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity,
        unit,
      })
      .execute();

    await this.recalculateCosts(recipeId);
  }

  async removeIngredient(
    recipeIngredientId: number,
    recipeId: number,
  ): Promise<void> {
    await db
      .deleteFrom("recipe_ingredients")
      .where("id", "=", recipeIngredientId)
      .execute();

    await this.recalculateCosts(recipeId);
  }

  async updateIngredient(
    recipeIngredientId: number,
    recipeId: number,
    quantity: number,
    unit: string,
  ): Promise<void> {
    await db
      .updateTable("recipe_ingredients")
      .set({
        quantity,
        unit,
      })
      .where("id", "=", recipeIngredientId)
      .execute();

    await this.recalculateCosts(recipeId);
  }

  async recalculateCosts(recipeId: number): Promise<void> {
    const recipe = await this.getById(recipeId);
    if (!recipe) return;

    // 1. Calculate Cost
    const { totalCost } = await calculateRecipeTotal(
      recipe.ingredients.map((i) => ({
        name: i.ingredientName,
        quantity: i.quantity,
        unit: i.unit,
        currentPricePerUnit: i.currentPricePerUnit,
        ingredientUnit: i.ingredientUnit as string,
        currency: i.currency || "USD",
      })),
      recipe.wasteBufferPercentage || 0,
      recipe.currency || "USD",
    );

    // 2. Calculate Suggested Price
    const suggestedPrice = calculateSuggestedPrice(
      totalCost,
      recipe.targetCostPercentage || 25,
    );

    // 3. Calculate Margin (use suggested price if selling price is empty)
    const effectivePrice = recipe.sellingPrice || suggestedPrice;
    const profitMargin = calculateProfitMargin(totalCost, effectivePrice);

    // 4. Update DB
    await db
      .updateTable("recipes")
      .set({
        total_cost: totalCost,
        profit_margin: profitMargin,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", recipeId)
      .execute();
  }

  // --- Experiment Management ---

  /**
   * Create an experiment (variant) from an existing recipe
   */
  async createExperiment(
    parentRecipeId: number,
    experimentName: string,
  ): Promise<Recipe> {
    const parentRecipe = await this.getById(parentRecipeId);
    if (!parentRecipe) {
      throw new Error(`Parent recipe ${parentRecipeId} not found`);
    }

    // Create a copy of the recipe as an experiment
    const experimentRecipe = await db
      .insertInto("recipes")
      .values({
        name: `${parentRecipe.name} - ${experimentName}`,
        description: parentRecipe.description,
        category: parentRecipe.category,
        servings: parentRecipe.servings,
        prep_time_minutes: parentRecipe.prepTimeMinutes,
        cooking_instructions: parentRecipe.cookingInstructions,
        selling_price: parentRecipe.sellingPrice,
        currency: parentRecipe.currency,
        target_cost_percentage: parentRecipe.targetCostPercentage,
        waste_buffer_percentage: parentRecipe.wasteBufferPercentage,
        total_cost: parentRecipe.totalCost,
        profit_margin: parentRecipe.profitMargin,
        is_experiment: 1,
        parent_recipe_id: parentRecipeId,
        experiment_name: experimentName,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Copy ingredients
    if (parentRecipe.ingredients && parentRecipe.ingredients.length > 0) {
      await db
        .insertInto("recipe_ingredients")
        .values(
          parentRecipe.ingredients.map((ing) => ({
            recipe_id: experimentRecipe.id,
            ingredient_id: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            cost: ing.cost,
            notes: ing.notes,
          })),
        )
        .execute();
    }

    return this.mapRowToRecipe(experimentRecipe);
  }

  /**
   * Get all experiments for a parent recipe
   */
  async getExperiments(parentRecipeId: number): Promise<Recipe[]> {
    const rows = await db
      .selectFrom("recipes")
      .selectAll()
      .where("parent_recipe_id", "=", parentRecipeId)
      .where("is_experiment", "=", 1)
      .orderBy("created_at", "desc")
      .execute();

    return rows.map(this.mapRowToRecipe);
  }

  /**
   * Apply experiment changes to the parent recipe
   */
  async applyExperimentToParent(experimentId: number): Promise<void> {
    const experiment = await this.getById(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Get parent recipe ID from the experiment row
    const experimentRow = await db
      .selectFrom("recipes")
      .select(["parent_recipe_id", "is_experiment"])
      .where("id", "=", experimentId)
      .executeTakeFirst();

    if (!experimentRow?.is_experiment || !experimentRow.parent_recipe_id) {
      throw new Error("Recipe is not an experiment or has no parent");
    }

    const parentId = experimentRow.parent_recipe_id;

    // Update parent with experiment data
    await this.update(parentId, {
      name: experiment.name.replace(/ - .*$/, ""), // Remove experiment suffix
      description: experiment.description,
      category: experiment.category,
      servings: experiment.servings,
      prepTimeMinutes: experiment.prepTimeMinutes,
      cookingInstructions: experiment.cookingInstructions,
      sellingPrice: experiment.sellingPrice,
      targetCostPercentage: experiment.targetCostPercentage,
      wasteBufferPercentage: experiment.wasteBufferPercentage,
      ingredients: experiment.ingredients?.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    });
  }

  private mapRowToRecipe(row: RecipeRow): Recipe {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as RecipeCategory,
      servings: row.servings,
      prepTimeMinutes: row.prep_time_minutes,
      cookingInstructions: row.cooking_instructions,
      sellingPrice: row.selling_price,
      currency: (row.currency || "USD") as Currency,
      targetCostPercentage: row.target_cost_percentage,
      wasteBufferPercentage: row.waste_buffer_percentage,
      totalCost: row.total_cost || 0,
      profitMargin: row.profit_margin || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isExperiment: row.is_experiment === 1,
      parentRecipeId: row.parent_recipe_id || undefined,
      experimentName: row.experiment_name || undefined,
    };
  }
}

export const recipesRepository = new RecipesRepository();
