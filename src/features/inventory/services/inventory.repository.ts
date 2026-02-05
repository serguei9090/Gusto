import { sql } from "kysely";
import type {
  CreateTransactionInput,
  InventoryTransaction,
} from "@/features/inventory/types";
import { db } from "@/lib/db";

class InventoryRepository {
  async logTransaction(
    data: CreateTransactionInput,
  ): Promise<InventoryTransaction> {
    const {
      ingredientId,
      transactionType,
      quantity,
      costPerUnit,
      totalCost,
      reference,
      notes,
    } = data;

    // Calculate delta for stock update
    let delta = quantity;
    if (transactionType === "usage" || transactionType === "waste") {
      delta = -Math.abs(quantity);
    } else if (transactionType === "purchase") {
      delta = Math.abs(quantity);
    }
    // "adjustment" uses the raw quantity value as a delta (can be positive or negative)

    return await db.transaction().execute(async (trx: any) => {
      // 1. Insert Transaction
      const result = await trx
        .insertInto("inventory_transactions")
        .values({
          ingredient_id: ingredientId,
          transaction_type: transactionType,
          quantity: quantity,
          cost_per_unit: costPerUnit,
          total_cost: totalCost,
          reference: reference,
          notes: notes,
          // created_at is default current_timestamp in schema
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      // 2. Update Ingredient Stock
      await trx
        .updateTable("ingredients")
        .set((_eb: any) => ({
          current_stock: sql`current_stock + ${delta}`,
          last_updated: sql`CURRENT_TIMESTAMP`,
        }))
        .where("id", "=", ingredientId)
        .execute();

      // Map snake_case result to camelCase (if needed, but Kysely usually maps based on dialect?
      // Actually, my Kysely setup might be returning raw snake_case from SQLite unless I used CamelCasePlugin.
      // The `db.ts` setup uses `SqliteAdapter`.
      // Let's assume the previous `recipes.repository.ts` worked without manual mapping or used `selectFrom`.
      // The legacy service manually selected specific fields or just `SELECT *`.
      // Let's return the result directly.

      return {
        id: result.id,
        ingredientId: result.ingredient_id,
        transactionType: result.transaction_type,
        quantity: result.quantity,
        costPerUnit: result.cost_per_unit,
        totalCost: result.total_cost,
        reference: result.reference,
        notes: result.notes,
        createdAt: result.created_at,
      } as InventoryTransaction;
    });
  }

  async getTransactionsByIngredient(
    ingredientId: number,
  ): Promise<InventoryTransaction[]> {
    const rows = await db
      .selectFrom("inventory_transactions")
      .selectAll()
      .where("ingredient_id", "=", ingredientId)
      .orderBy("created_at", "desc")
      .execute();

    return rows.map((row: any) => ({
      id: row.id,
      ingredientId: row.ingredient_id,
      transactionType: row.transaction_type,
      quantity: row.quantity,
      costPerUnit: row.cost_per_unit,
      totalCost: row.total_cost,
      reference: row.reference,
      notes: row.notes,
      createdAt: row.created_at,
    })) as InventoryTransaction[];
  }

  async getAllTransactions(limit = 50): Promise<InventoryTransaction[]> {
    const rows = await db
      .selectFrom("inventory_transactions")
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(limit)
      .execute();

    return rows.map((row: any) => ({
      id: row.id,
      ingredientId: row.ingredient_id,
      transactionType: row.transaction_type,
      quantity: row.quantity,
      costPerUnit: row.cost_per_unit,
      totalCost: row.total_cost,
      reference: row.reference,
      notes: row.notes,
      createdAt: row.created_at,
    })) as InventoryTransaction[];
  }

  // biome-ignore lint/suspicious/noExplicitAny: Legacy return type
  async getLowStockItems(): Promise<any[]> {
    // Legacy return type was any[], but it returned ingredients.
    // We should map this too if possible, but for now matching legacy structure.
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .whereRef("current_stock", "<=", "min_stock_level")
      .orderBy(sql`(current_stock / NULLIF(min_stock_level, 0))`, "asc") // Prevent div by zero if min_stock is 0
      .execute();

    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      unitOfMeasure: row.unit_of_measure,
      currentPrice: row.current_price,
      pricePerUnit: row.price_per_unit,
      supplierId: row.supplier_id,
      minStockLevel: row.min_stock_level,
      currentStock: row.current_stock,
      lastUpdated: row.last_updated,
      notes: row.notes,
    }));
  }
}

export const inventoryRepository = new InventoryRepository();
