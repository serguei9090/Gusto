import { sql } from "kysely";
import { db } from "@/lib/db";

export interface RecipeVersion {
  id: number;
  recipeId: number;
  versionNumber: number;
  name: string;
  description: string | null;
  category: string | null;
  servings: number;
  prepTimeMinutes: number | null;
  cookingInstructions: string | null;
  sellingPrice: number | null;
  currency: string;
  targetCostPercentage: number | null;
  wasteBufferPercentage: number | null;
  totalCost: number | null;
  profitMargin: number | null;
  ingredientsSnapshot: Array<{
    id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    cost: number | null;
    notes: string | null;
  }>;
  changeReason: string | null;
  changeNotes: string | null;
  createdBy: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export interface CreateVersionInput {
  recipeId: number;
  changeReason?: string;
  changeNotes?: string;
  createdBy?: string;
}

export interface VersionComparison {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

/**
 * Repository for managing recipe versions
 */
export class RecipeVersionRepository {
  /**
   * Create a new version of a recipe
   */
  async createVersion(input: CreateVersionInput): Promise<RecipeVersion> {
    const { recipeId, changeReason, changeNotes, createdBy } = input;

    // Get current recipe data
    const recipe = await db
      .selectFrom("recipes")
      .selectAll()
      .where("id", "=", recipeId)
      .executeTakeFirst();

    if (!recipe) {
      throw new Error(`Recipe with id ${recipeId} not found`);
    }

    // Get current ingredients
    const ingredients = await db
      .selectFrom("recipe_ingredients")
      .selectAll()
      .where("recipe_id", "=", recipeId)
      .execute();

    // Get next version number
    const lastVersion = await db
      .selectFrom("recipe_versions")
      .select("version_number")
      .where("recipe_id", "=", recipeId)
      .orderBy("version_number", "desc")
      .limit(1)
      .executeTakeFirst();

    const nextVersion = (lastVersion?.version_number ?? 0) + 1;

    // Mark all previous versions as not current
    await db
      .updateTable("recipe_versions")
      .set({ is_current: 0 })
      .where("recipe_id", "=", recipeId)
      .execute();

    // Create new version
    const result = await db
      .insertInto("recipe_versions")
      .values({
        recipe_id: recipeId,
        version_number: nextVersion,
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        servings: recipe.servings,
        prep_time_minutes: recipe.prep_time_minutes,
        cooking_instructions: recipe.cooking_instructions,
        selling_price: recipe.selling_price,
        currency: recipe.currency,
        target_cost_percentage: recipe.target_cost_percentage,
        waste_buffer_percentage: recipe.waste_buffer_percentage,
        total_cost: recipe.total_cost,
        profit_margin: recipe.profit_margin,
        ingredients_snapshot: JSON.stringify(ingredients),
        change_reason: changeReason || null,
        change_notes: changeNotes || null,
        created_by: createdBy || null,
        is_current: 1,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Update recipe version info
    await db
      .updateTable("recipes")
      .set({
        current_version: nextVersion,
        last_version_date: sql<string>`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", recipeId)
      .execute();

    return this.mapToRecipeVersion(result);
  }

  /**
   * Get all versions for a recipe
   */
  async getVersions(recipeId: number): Promise<RecipeVersion[]> {
    const versions = await db
      .selectFrom("recipe_versions")
      .selectAll()
      .where("recipe_id", "=", recipeId)
      .orderBy("version_number", "desc")
      .execute();

    return versions.map((v) => this.mapToRecipeVersion(v));
  }

  /**
   * Get a specific version
   */
  async getVersion(
    recipeId: number,
    versionNumber: number,
  ): Promise<RecipeVersion | null> {
    const version = await db
      .selectFrom("recipe_versions")
      .selectAll()
      .where("recipe_id", "=", recipeId)
      .where("version_number", "=", versionNumber)
      .executeTakeFirst();

    return version ? this.mapToRecipeVersion(version) : null;
  }

  /**
   * Get current version
   */
  async getCurrentVersion(recipeId: number): Promise<RecipeVersion | null> {
    const version = await db
      .selectFrom("recipe_versions")
      .selectAll()
      .where("recipe_id", "=", recipeId)
      .where("is_current", "=", 1)
      .executeTakeFirst();

    return version ? this.mapToRecipeVersion(version) : null;
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(
    recipeId: number,
    versionNumber: number,
    reason?: string,
  ): Promise<void> {
    const targetVersion = await this.getVersion(recipeId, versionNumber);

    if (!targetVersion) {
      throw new Error(
        `Version ${versionNumber} not found for recipe ${recipeId}`,
      );
    }

    // Update recipe with version data
    await db
      .updateTable("recipes")
      .set({
        name: targetVersion.name,
        description: targetVersion.description,
        category: targetVersion.category,
        servings: targetVersion.servings,
        prep_time_minutes: targetVersion.prepTimeMinutes,
        cooking_instructions: targetVersion.cookingInstructions,
        selling_price: targetVersion.sellingPrice,
        currency: targetVersion.currency,
        target_cost_percentage: targetVersion.targetCostPercentage,
        waste_buffer_percentage: targetVersion.wasteBufferPercentage,
        total_cost: targetVersion.totalCost,
        profit_margin: targetVersion.profitMargin,
      })
      .where("id", "=", recipeId)
      .execute();

    // Delete current recipe ingredients
    await db
      .deleteFrom("recipe_ingredients")
      .where("recipe_id", "=", recipeId)
      .execute();

    // Restore ingredients from snapshot
    if (targetVersion.ingredientsSnapshot.length > 0) {
      await db
        .insertInto("recipe_ingredients")
        .values(
          targetVersion.ingredientsSnapshot.map((ing) => ({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit: ing.unit,
            cost: ing.cost,
            notes: ing.notes,
          })),
        )
        .execute();
    }

    // Create a new version to record the rollback
    await this.createVersion({
      recipeId,
      changeReason: reason || `Rolled back to version ${versionNumber}`,
      createdBy: "system",
    });
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    recipeId: number,
    version1: number,
    version2: number,
  ): Promise<VersionComparison[]> {
    const v1 = await this.getVersion(recipeId, version1);
    const v2 = await this.getVersion(recipeId, version2);

    if (!v1 || !v2) {
      throw new Error("One or both versions not found");
    }

    const comparisons: VersionComparison[] = [];

    // Compare fields
    const fields: Array<keyof RecipeVersion> = [
      "name",
      "description",
      "category",
      "servings",
      "prepTimeMinutes",
      "cookingInstructions",
      "sellingPrice",
      "currency",
      "targetCostPercentage",
      "wasteBufferPercentage",
      "totalCost",
      "profitMargin",
    ];

    for (const field of fields) {
      const oldValue = v1[field];
      const newValue = v2[field];
      comparisons.push({
        field: String(field),
        oldValue,
        newValue,
        changed: JSON.stringify(oldValue) !== JSON.stringify(newValue),
      });
    }

    // Compare ingredients
    comparisons.push({
      field: "ingredients",
      oldValue: v1.ingredientsSnapshot,
      newValue: v2.ingredientsSnapshot,
      changed:
        JSON.stringify(v1.ingredientsSnapshot) !==
        JSON.stringify(v2.ingredientsSnapshot),
    });

    return comparisons;
  }

  /**
   * Get cost history for a recipe
   */
  async getCostHistory(
    recipeId: number,
  ): Promise<Array<{ version: number; totalCost: number; date: string }>> {
    const versions = await db
      .selectFrom("recipe_versions")
      .select(["version_number", "total_cost", "created_at"])
      .where("recipe_id", "=", recipeId)
      .orderBy("version_number", "asc")
      .execute();

    return versions.map((v) => ({
      version: v.version_number,
      totalCost: v.total_cost ?? 0,
      date: v.created_at,
    }));
  }

  /**
   * Delete old versions (keep last N versions)
   */
  async pruneOldVersions(recipeId: number, keepCount = 10): Promise<number> {
    const versions = await db
      .selectFrom("recipe_versions")
      .select("id")
      .where("recipe_id", "=", recipeId)
      .where("is_current", "=", 0)
      .orderBy("version_number", "desc")
      .offset(keepCount)
      .execute();

    if (versions.length === 0) return 0;

    const idsToDelete = versions.map((v) => v.id);

    const result = await db
      .deleteFrom("recipe_versions")
      .where("id", "in", idsToDelete as unknown as number[])
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
  }

  /**
   * Map database row to RecipeVersion
   */
  private mapToRecipeVersion(row: {
    id: number;
    recipe_id: number;
    version_number: number;
    name: string;
    description: string | null;
    category: string | null;
    servings: number;
    prep_time_minutes: number | null;
    cooking_instructions: string | null;
    selling_price: number | null;
    currency: string;
    target_cost_percentage: number | null;
    waste_buffer_percentage: number | null;
    total_cost: number | null;
    profit_margin: number | null;
    ingredients_snapshot: string;
    change_reason: string | null;
    change_notes: string | null;
    created_by: string | null;
    created_at: string;
    is_current: number;
  }): RecipeVersion {
    return {
      id: row.id,
      recipeId: row.recipe_id,
      versionNumber: row.version_number,
      name: row.name,
      description: row.description,
      category: row.category,
      servings: row.servings,
      prepTimeMinutes: row.prep_time_minutes,
      cookingInstructions: row.cooking_instructions,
      sellingPrice: row.selling_price,
      currency: row.currency,
      targetCostPercentage: row.target_cost_percentage,
      wasteBufferPercentage: row.waste_buffer_percentage,
      totalCost: row.total_cost,
      profitMargin: row.profit_margin,
      ingredientsSnapshot: JSON.parse(row.ingredients_snapshot),
      changeReason: row.change_reason,
      changeNotes: row.change_notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      isCurrent: row.is_current === 1,
    };
  }
}

export const recipeVersionRepository = new RecipeVersionRepository();
