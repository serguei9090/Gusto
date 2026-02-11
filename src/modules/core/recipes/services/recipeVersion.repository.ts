import type { Selectable } from "kysely";
import { sql } from "kysely";
import { db } from "@/lib/db";
import type { RecipeVersionsTable } from "@/types/db.types";

export interface RecipeVersion {
  id: number;
  recipeId: number;
  versionNumber: number;
  name: string;
  description: string | null;
  category: string | null;
  servings: number;
  yieldAmount: number | null;
  yieldUnit: string | null;
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
    ingredient_id: number | null;
    sub_recipe_id: number | null;
    quantity: number;
    unit: string;
    cost: number | null;
    notes: string | null;
  }>;
  changeReason: string | null;
  changeNotes: string | null;
  createdBy: string | null;
  allergens?: string[];
  dietaryRestrictions?: string[];
  calories?: number | null;
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

export interface DetailedVersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified" | "unchanged";
  percentChange?: number; // For numeric fields
}

export interface IngredientDiff {
  ingredientId: number | null;
  subRecipeId: number | null;
  ingredientName: string;
  changeType: "added" | "removed" | "modified" | "unchanged";
  quantityChange?: { old: number; new: number };
  costChange?: { old: number | null; new: number | null };
  unitChange?: { old: string; new: string };
  isSubRecipe?: boolean;
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
        yield_amount: recipe.yield_amount,
        yield_unit: recipe.yield_unit,
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
        allergens: recipe.allergens,
        dietary_restrictions: recipe.dietary_restrictions,
        calories: recipe.calories,
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
        yield_amount: targetVersion.yieldAmount,
        yield_unit: targetVersion.yieldUnit,
        prep_time_minutes: targetVersion.prepTimeMinutes,
        cooking_instructions: targetVersion.cookingInstructions,
        selling_price: targetVersion.sellingPrice,
        currency: targetVersion.currency,
        target_cost_percentage: targetVersion.targetCostPercentage,
        waste_buffer_percentage: targetVersion.wasteBufferPercentage,
        total_cost: targetVersion.totalCost,
        profit_margin: targetVersion.profitMargin,
        allergens: targetVersion.allergens
          ? JSON.stringify(targetVersion.allergens)
          : null,
        dietary_restrictions: targetVersion.dietaryRestrictions
          ? JSON.stringify(targetVersion.dietaryRestrictions)
          : null,
        calories: targetVersion.calories,
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
            sub_recipe_id: ing.sub_recipe_id,
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
   * Bulk rollback all recipes to their state at a specific date/time
   * Returns the number of recipes affected
   */
  async bulkRollbackToDate(date: string, reason?: string): Promise<number> {
    // Get all recipe IDs
    const recipeIds = await db.selectFrom("recipes").select("id").execute();

    let affectedCount = 0;

    for (const { id } of recipeIds) {
      // Find the most recent version before the given date
      const version = await db
        .selectFrom("recipe_versions")
        .select("version_number")
        .where("recipe_id", "=", id)
        .where("created_at", "<=", date)
        .orderBy("created_at", "desc")
        .executeTakeFirst();

      if (version) {
        await this.rollbackToVersion(
          id,
          version.version_number,
          reason || `Bulk rollback to state at ${date}`,
        );
        affectedCount++;
      }
    }

    return affectedCount;
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
      "yieldAmount",
      "yieldUnit",
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
   * Build an IngredientDiff object for a modified ingredient
   * @private
   */
  private buildModifiedIngredientDiff(
    oldIng: RecipeVersion["ingredientsSnapshot"][0],
    newIng: RecipeVersion["ingredientsSnapshot"][0],
  ): IngredientDiff {
    const quantityChanged = oldIng.quantity !== newIng.quantity;
    const costChanged = oldIng.cost !== newIng.cost;
    const unitChanged = oldIng.unit !== newIng.unit;
    const isModified = quantityChanged || costChanged || unitChanged;

    return {
      ingredientId: oldIng.ingredient_id,
      subRecipeId: oldIng.sub_recipe_id,
      ingredientName: oldIng.ingredient_id
        ? `Ingredient ${oldIng.ingredient_id}`
        : `Sub-Recipe ${oldIng.sub_recipe_id}`,
      changeType: isModified ? "modified" : "unchanged",
      quantityChange: isModified
        ? { old: oldIng.quantity, new: newIng.quantity }
        : undefined,
      costChange: isModified
        ? { old: oldIng.cost, new: newIng.cost }
        : undefined,
      unitChange: isModified
        ? { old: oldIng.unit, new: newIng.unit }
        : undefined,
      isSubRecipe: !!oldIng.sub_recipe_id,
    };
  }

  /**
   * Build an IngredientDiff object for a removed ingredient
   * @private
   */
  private buildRemovedIngredientDiff(
    oldIng: RecipeVersion["ingredientsSnapshot"][0],
  ): IngredientDiff {
    return {
      ingredientId: oldIng.ingredient_id,
      subRecipeId: oldIng.sub_recipe_id,
      ingredientName: oldIng.ingredient_id
        ? `Ingredient ${oldIng.ingredient_id}`
        : `Sub-Recipe ${oldIng.sub_recipe_id}`,
      changeType: "removed",
      quantityChange: { old: oldIng.quantity, new: 0 },
      costChange: { old: oldIng.cost, new: null },
      unitChange: { old: oldIng.unit, new: "" },
      isSubRecipe: !!oldIng.sub_recipe_id,
    };
  }

  /**
   * Build an IngredientDiff object for an added ingredient
   * @private
   */
  private buildAddedIngredientDiff(
    newIng: RecipeVersion["ingredientsSnapshot"][0],
  ): IngredientDiff {
    return {
      ingredientId: newIng.ingredient_id,
      subRecipeId: newIng.sub_recipe_id,
      ingredientName: newIng.ingredient_id
        ? `Ingredient ${newIng.ingredient_id}`
        : `Sub-Recipe ${newIng.sub_recipe_id}`,
      changeType: "added",
      quantityChange: { old: 0, new: newIng.quantity },
      costChange: { old: null, new: newIng.cost },
      unitChange: { old: "", new: newIng.unit },
      isSubRecipe: !!newIng.sub_recipe_id,
    };
  }

  /**
   * Phase 1: Match ingredients by exact Row ID
   * @private
   */
  private matchIngredientsByRowId(
    v1Pool: RecipeVersion["ingredientsSnapshot"],
    v2Pool: RecipeVersion["ingredientsSnapshot"],
    matchedIndicesV1: Set<number>,
    matchedIndicesV2: Set<number>,
    ingredientDiff: IngredientDiff[],
  ): void {
    for (let i = 0; i < v1Pool.length; i++) {
      const oldIng = v1Pool[i];
      const matchIndex = v2Pool.findIndex(
        (newIng, idx) => !matchedIndicesV2.has(idx) && newIng.id === oldIng.id,
      );

      if (matchIndex !== -1) {
        const newIng = v2Pool[matchIndex];
        matchedIndicesV1.add(i);
        matchedIndicesV2.add(matchIndex);
        ingredientDiff.push(this.buildModifiedIngredientDiff(oldIng, newIng));
      }
    }
  }

  /**
   * Phase 2: Match ingredients by Ingredient Type (Semantic Identity)
   * @private
   */
  private matchIngredientsByType(
    v1Pool: RecipeVersion["ingredientsSnapshot"],
    v2Pool: RecipeVersion["ingredientsSnapshot"],
    matchedIndicesV1: Set<number>,
    matchedIndicesV2: Set<number>,
    ingredientDiff: IngredientDiff[],
  ): void {
    for (let i = 0; i < v1Pool.length; i++) {
      if (matchedIndicesV1.has(i)) continue;

      const oldIng = v1Pool[i];
      const matchIndex = v2Pool.findIndex(
        (newIng, idx) =>
          !matchedIndicesV2.has(idx) &&
          ((oldIng.ingredient_id &&
            newIng.ingredient_id === oldIng.ingredient_id) ||
            (oldIng.sub_recipe_id &&
              newIng.sub_recipe_id === oldIng.sub_recipe_id)),
      );

      if (matchIndex !== -1) {
        const newIng = v2Pool[matchIndex];
        matchedIndicesV1.add(i);
        matchedIndicesV2.add(matchIndex);
        ingredientDiff.push(this.buildModifiedIngredientDiff(oldIng, newIng));
      }
    }
  }

  /**
   * Phase 3: Process remaining unmatched ingredients (removed/added)
   * @private
   */
  private processUnmatchedIngredients(
    v1Pool: RecipeVersion["ingredientsSnapshot"],
    v2Pool: RecipeVersion["ingredientsSnapshot"],
    matchedIndicesV1: Set<number>,
    matchedIndicesV2: Set<number>,
    ingredientDiff: IngredientDiff[],
  ): void {
    // Remaining V1 -> Removed
    for (let i = 0; i < v1Pool.length; i++) {
      if (!matchedIndicesV1.has(i)) {
        ingredientDiff.push(this.buildRemovedIngredientDiff(v1Pool[i]));
      }
    }

    // Remaining V2 -> Added
    for (let i = 0; i < v2Pool.length; i++) {
      if (!matchedIndicesV2.has(i)) {
        ingredientDiff.push(this.buildAddedIngredientDiff(v2Pool[i]));
      }
    }
  }

  /**
   * Build recipe field differences
   * @private
   */
  private buildRecipeDiff(
    v1: RecipeVersion,
    v2: RecipeVersion,
  ): DetailedVersionDiff[] {
    const recipeDiff: DetailedVersionDiff[] = [];

    const numericFields: Array<{
      key: keyof RecipeVersion;
      name: string;
    }> = [
      { key: "servings", name: "Servings" },
      { key: "prepTimeMinutes", name: "Prep Time (minutes)" },
      { key: "sellingPrice", name: "Selling Price" },
      { key: "targetCostPercentage", name: "Target Cost %" },
      { key: "wasteBufferPercentage", name: "Waste Buffer %" },
      { key: "totalCost", name: "Total Cost" },
      { key: "profitMargin", name: "Profit Margin %" },
      { key: "calories", name: "Calories" },
    ];

    const textFields: Array<{
      key: keyof RecipeVersion;
      name: string;
    }> = [
      { key: "name", name: "Name" },
      { key: "description", name: "Description" },
      { key: "category", name: "Category" },
      { key: "currency", name: "Currency" },
      { key: "cookingInstructions", name: "Cooking Instructions" },
      { key: "allergens", name: "Allergens" },
      { key: "dietaryRestrictions", name: "Dietary Restrictions" },
    ];

    // Process numeric fields with percentage change
    for (const { key, name } of numericFields) {
      const oldValue = v1[key] as number | null;
      const newValue = v2[key] as number | null;
      const changed = oldValue !== newValue;

      let percentChange: number | undefined;
      if (changed && oldValue && newValue && oldValue !== 0) {
        percentChange = ((newValue - oldValue) / oldValue) * 100;
      }

      recipeDiff.push({
        field: name,
        oldValue,
        newValue,
        changeType: changed ? "modified" : "unchanged",
        percentChange,
      });
    }

    // Process text fields
    for (const { key, name } of textFields) {
      const oldValue = v1[key];
      const newValue = v2[key];
      const changed = oldValue !== newValue;

      recipeDiff.push({
        field: name,
        oldValue,
        newValue,
        changeType: changed ? "modified" : "unchanged",
      });
    }

    return recipeDiff;
  }

  /**
   * Compare two versions with detailed diff information
   */
  async compareVersionsDetailed(
    recipeId: number,
    version1: number,
    version2: number,
  ): Promise<{
    recipeDiff: DetailedVersionDiff[];
    ingredientDiff: IngredientDiff[];
  }> {
    const v1 = await this.getVersion(recipeId, version1);
    const v2 = await this.getVersion(recipeId, version2);

    if (!v1 || !v2) {
      throw new Error("One or both versions not found");
    }

    // Compare recipe fields
    const recipeDiff = this.buildRecipeDiff(v1, v2);

    // Compare ingredients using Hybrid Matching Strategy
    const ingredientDiff: IngredientDiff[] = [];
    const v1Pool = [...v1.ingredientsSnapshot];
    const v2Pool = [...v2.ingredientsSnapshot];
    const matchedIndicesV1 = new Set<number>();
    const matchedIndicesV2 = new Set<number>();

    // Phase 1: Match by exact Row ID
    this.matchIngredientsByRowId(
      v1Pool,
      v2Pool,
      matchedIndicesV1,
      matchedIndicesV2,
      ingredientDiff,
    );

    // Phase 2: Match by Ingredient Type
    this.matchIngredientsByType(
      v1Pool,
      v2Pool,
      matchedIndicesV1,
      matchedIndicesV2,
      ingredientDiff,
    );

    // Phase 3: Process unmatched (removed/added)
    this.processUnmatchedIngredients(
      v1Pool,
      v2Pool,
      matchedIndicesV1,
      matchedIndicesV2,
      ingredientDiff,
    );

    return {
      recipeDiff,
      ingredientDiff,
    };
  }

  /**
   * Export version history to CSV format
   */
  async exportHistoryToCSV(recipeId: number): Promise<string> {
    const versions = await this.getVersions(recipeId);

    if (versions.length === 0) {
      throw new Error("No version history to export");
    }

    // CSV Headers
    const headers = [
      "Version",
      "Date",
      "Name",
      "Total Cost",
      "Profit Margin %",
      "Selling Price",
      "Currency",
      "Servings",
      "Ingredient Count",
      "Change Reason",
      "Change Notes",
      "Created By",
    ];

    // Helper to escape CSV values
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replaceAll('"', '""')}"`;
      }
      return str;
    };

    // Build rows
    const rows = versions.map((v) => [
      v.versionNumber,
      v.createdAt,
      escapeCSV(v.name),
      v.totalCost?.toFixed(2) || "0.00",
      v.profitMargin?.toFixed(2) || "0.00",
      v.sellingPrice?.toFixed(2) || "",
      v.currency,
      v.servings,
      v.ingredientsSnapshot.length,
      escapeCSV(v.changeReason || ""),
      escapeCSV(v.changeNotes || ""),
      escapeCSV(v.createdBy || ""),
    ]);

    // Combine headers and rows
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    return csv;
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
  private mapToRecipeVersion(
    row: Selectable<RecipeVersionsTable>,
  ): RecipeVersion {
    return {
      id: row.id,
      recipeId: row.recipe_id,
      versionNumber: row.version_number,
      name: row.name,
      description: row.description,
      category: row.category,
      servings: row.servings,
      yieldAmount: row.yield_amount,
      yieldUnit: row.yield_unit,
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
      allergens: row.allergens ? JSON.parse(row.allergens) : [],
      dietaryRestrictions: row.dietary_restrictions
        ? JSON.parse(row.dietary_restrictions)
        : [],
      calories: row.calories,
      createdAt: row.created_at,
      isCurrent: row.is_current === 1,
    };
  }
}

export const recipeVersionRepository = new RecipeVersionRepository();
