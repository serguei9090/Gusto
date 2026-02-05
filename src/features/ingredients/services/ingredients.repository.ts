import { db } from "@/lib/db";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../types";
import { logger } from "@/utils/logger";

export class IngredientsRepository {
  async create(data: CreateIngredientInput): Promise<Ingredient> {
    logger.debug("IngredientsRepository.create: Starting insert", data);

    // Ensure numeric values are valid
    const payload = {
      name: data.name,
      category: data.category,
      unit_of_measure: data.unitOfMeasure,
      current_price: data.currentPrice || 0,
      price_per_unit: data.pricePerUnit || 0,
      currency: data.currency || 'USD',
      supplier_id: data.supplierId || null,
      min_stock_level: data.minStockLevel || 0,
      current_stock: data.currentStock || 0,
      notes: data.notes || null,
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

      if (!result || !result.id) {
        logger.error("IngredientsRepository.create: Failed to retrieve ID.", { payload, result });
        throw new Error("Failed to insert ingredient: could not retrieve ID.");
      }

      logger.debug("IngredientsRepository.create: Insert successful", result);

      // We still need to fetch full object or just assume it matches what we sent + defaults.
      // fetching is safer for defaults like last_updated.
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
      .orderBy("name", "asc")
      .execute();

    return rows.map(this.mapRowToIngredient);
  }

  async update(
    id: number,
    data: UpdateIngredientInput,
  ): Promise<Ingredient | null> {
    // Build update object only with defined values
    const updateData: any = {
      last_updated: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitOfMeasure !== undefined)
      updateData.unit_of_measure = data.unitOfMeasure;
    if (data.currentPrice !== undefined)
      updateData.current_price = data.currentPrice;
    if (data.pricePerUnit !== undefined)
      updateData.price_per_unit = data.pricePerUnit;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.supplierId !== undefined) updateData.supplier_id = data.supplierId;
    if (data.minStockLevel !== undefined)
      updateData.min_stock_level = data.minStockLevel;
    if (data.currentStock !== undefined)
      updateData.current_stock = data.currentStock;
    if (data.notes !== undefined) updateData.notes = data.notes;

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
    const result = await db
      .deleteFrom("ingredients")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async search(query: string): Promise<Ingredient[]> {
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .where("name", "like", `%${query}%`)
      .orderBy("name", "asc")
      .execute();

    return rows.map(this.mapRowToIngredient);
  }

  async getLowStock(): Promise<Ingredient[]> {
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .where((eb: any) =>
        eb.and([
          eb("min_stock_level", "is not", null),
          eb("current_stock", "<", eb.ref("min_stock_level")),
        ]),
      )
      .execute();

    return rows.map(this.mapRowToIngredient);
  }

  // biome-ignore lint/suspicious/noExplicitAny: Row type from Kysely raw result
  private mapRowToIngredient(row: any): Ingredient {
    return {
      id: row.id,
      name: row.name,
      // biome-ignore lint/suspicious/noExplicitAny: Legacy type casting
      category: row.category as any, // Cast to union type
      // biome-ignore lint/suspicious/noExplicitAny: Legacy type casting
      unitOfMeasure: row.unit_of_measure as any,
      currentPrice: row.current_price,
      pricePerUnit: row.price_per_unit || 0, // Fallback if null in DB
      currency: row.currency || 'USD',
      supplierId: row.supplier_id,
      minStockLevel: row.min_stock_level,
      currentStock: row.current_stock,
      lastUpdated: row.last_updated,
      notes: row.notes,
    };
  }
}

export const ingredientsRepository = new IngredientsRepository();
