import type { ExpressionBuilder, Selectable } from "kysely";
import { db } from "@/lib/db";
import type { Database, IngredientsTable } from "@/types/db.types";

export type IngredientRow = Selectable<IngredientsTable>;

import { logger } from "@/utils/logger";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../types";

export class IngredientsRepository {
  async create(data: CreateIngredientInput): Promise<Ingredient> {
    logger.debug("IngredientsRepository.create: Starting insert", data);

    // Ensure numeric values are valid
    const payload = {
      name: data.name,
      category: data.category,
      unit_of_measure: data.unitOfMeasure,
      current_price: data.currentPrice
        ? Number(data.currentPrice.toFixed(2))
        : 0,
      price_per_unit: data.pricePerUnit
        ? Number(data.pricePerUnit.toFixed(2))
        : 0,
      currency: data.currency || "USD",
      supplier_id: data.supplierId || null,
      min_stock_level: data.minStockLevel || 0,
      current_stock: data.currentStock || 0,
      notes: data.notes || null,
      purchase_unit: data.purchaseUnit || null,
      conversion_ratio: data.conversionRatio || 1,
      is_active: data.isActive === false ? 0 : 1,
    };

    try {
      // Modern SQLite approach: Use RETURNING clause
      // This works on Tauri because our custom dialect routes "RETURNING" queries to db.select()
      // yielding the actual row immediately.
      const result = await db
        .insertInto("ingredients")
        .values(payload)
        .returning("id")
        .executeTakeFirst();

      if (!result?.id) {
        logger.error("IngredientsRepository.create: Failed to retrieve ID.", {
          payload,
          result,
        });
        throw new Error("Failed to insert ingredient: could not retrieve ID.");
      }

      logger.debug("IngredientsRepository.create: Insert successful", result);

      // 1. Record initial stock transaction if stock > 0
      if (data.currentStock && data.currentStock > 0) {
        await db
          .insertInto("inventory_transactions")
          .values({
            ingredient_id: result.id,
            transaction_type: "purchase", // Use purchase for initial stock to establish cost basis
            quantity: data.currentStock,
            cost_per_unit: data.pricePerUnit || 0,
            total_cost: (data.currentStock || 0) * (data.pricePerUnit || 0),
            notes: "Initial stock on creation",
            item_type: "ingredient",
          })
          .execute();
      }

      // 2. Fetch full object
      return this.getById(result.id) as Promise<Ingredient>;
    } catch (error) {
      logger.error("IngredientsRepository.create: DB Error", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Ingredient | null> {
    const row = await db
      .selectFrom("ingredients")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return row ? this.mapRowToIngredient(row) : null;
  }

  async getAll(): Promise<Ingredient[]> {
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .where("is_active", "=", 1)
      .orderBy("name", "asc")
      .execute();

    return rows.map(this.mapRowToIngredient);
  }

  /**
   * Builds update data object from partial ingredient input
   * @private
   */
  private buildUpdateData(
    data: UpdateIngredientInput,
  ): Record<string, unknown> {
    const updateData: Record<string, unknown> = {
      last_updated: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitOfMeasure !== undefined)
      updateData.unit_of_measure = data.unitOfMeasure;
    if (data.currentPrice !== undefined)
      updateData.current_price = Number(data.currentPrice.toFixed(2));
    if (data.pricePerUnit !== undefined)
      updateData.price_per_unit = Number(data.pricePerUnit.toFixed(2));
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.supplierId !== undefined) updateData.supplier_id = data.supplierId;
    if (data.minStockLevel !== undefined)
      updateData.min_stock_level = data.minStockLevel;
    if (data.currentStock !== undefined)
      updateData.current_stock = data.currentStock;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.purchaseUnit !== undefined)
      updateData.purchase_unit = data.purchaseUnit;
    if (data.conversionRatio !== undefined)
      updateData.conversion_ratio = data.conversionRatio;
    if (data.isActive !== undefined)
      updateData.is_active = data.isActive ? 1 : 0;

    return updateData;
  }

  async update(
    id: number,
    data: UpdateIngredientInput,
  ): Promise<Ingredient | null> {
    const updateData = this.buildUpdateData(data);

    const result = await db
      .updateTable("ingredients")
      .set(updateData)
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();

    if (!result) return null;

    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    // Check if ingredient is used in any recipes
    const usageCount = await db
      .selectFrom("recipe_ingredients")
      .select((eb) => eb.fn.count("id").as("count"))
      .where("ingredient_id", "=", id)
      .executeTakeFirst();

    const count = Number(usageCount?.count || 0);
    if (count > 0) {
      throw new Error(`Cannot delete ingredient: Used in ${count} recipes.`);
    }

    const result = await db
      .deleteFrom("ingredients")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async archive(id: number): Promise<boolean> {
    const result = await db
      .updateTable("ingredients")
      .set({ is_active: 0 })
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  async search(query: string): Promise<Ingredient[]> {
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .where("name", "like", `%${query}%`)
      .where("is_active", "=", 1)
      .orderBy("name", "asc")
      .execute();

    return rows.map(this.mapRowToIngredient);
  }

  async getLowStock(): Promise<Ingredient[]> {
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .where((eb: ExpressionBuilder<Database, "ingredients">) =>
        eb.and([
          eb("min_stock_level", "is not", null),
          eb("current_stock", "<", eb.ref("min_stock_level")),
          eb("is_active", "=", 1),
        ]),
      )
      .execute();

    return rows.map(this.mapRowToIngredient);
  }

  private mapRowToIngredient(row: IngredientRow): Ingredient {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      unitOfMeasure: row.unit_of_measure,
      currentPrice: row.current_price,
      pricePerUnit: row.price_per_unit || 0, // Fallback if null in DB
      currency: row.currency || "USD",
      supplierId: row.supplier_id,
      minStockLevel: row.min_stock_level,
      currentStock: row.current_stock,
      lastUpdated: row.last_updated,
      notes: row.notes,
      purchaseUnit: row.purchase_unit,
      conversionRatio: row.conversion_ratio,
      isActive: Boolean(row.is_active),
    };
  }
}

export const ingredientsRepository = new IngredientsRepository();
