import { db } from "@/lib/db";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../types";

export class IngredientsRepository {
  async create(data: CreateIngredientInput): Promise<Ingredient> {
    const result = await db
      .insertInto("ingredients")
      .values({
        name: data.name,
        category: data.category,
        unit_of_measure: data.unitOfMeasure,
        current_price: data.currentPrice,
        price_per_unit: data.pricePerUnit,
        currency: data.currency || 'USD',
        supplier_id: data.supplierId || null,
        min_stock_level: data.minStockLevel || null,
        current_stock: data.currentStock || 0,
        notes: data.notes || null,
      })
      .executeTakeFirstOrThrow();

    // Safe cast or fetch because insertId is BigInt/Number
    let id = Number(result.insertId);

    // Fallback: If insertId is missing but rows were affected, fetch the latest entry
    if (!id && result.numInsertedOrUpdatedRows > BigInt(0)) {
      const latest = await db.selectFrom("ingredients").select("id").orderBy("id", "desc").limit(1).executeTakeFirst();
      if (latest) id = latest.id;
    }

    if (!id) throw new Error("Failed to insert ingredient");

    return this.getById(id) as Promise<Ingredient>;
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
      last_updated: new Date().toISOString(), // Or let DB handle via default but explicit is fine
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
      .executeTakeFirst();

    // Kysely UpdateResult has numUpdatedRows
    if (Number(result.numUpdatedRows) === 0) return null;

    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .deleteFrom("ingredients")
      .where("id", "=", id)
      .executeTakeFirst();

    // Kysely DeleteResult has numDeletedRows
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
    // Check for validity of row properties if needed, but Kysely types help ensures this
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
