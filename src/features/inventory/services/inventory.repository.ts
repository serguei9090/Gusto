import type { Selectable } from "kysely";
import { sql } from "kysely";
import type {
  CreateTransactionInput,
  Ingredient,
  InventoryTransaction,
} from "@/features/inventory/types";
import { db } from "@/lib/db";
import type { InventoryTransactionsTable } from "@/types/db.types";

export type TransactionRow = Selectable<InventoryTransactionsTable>;

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
      currency,
    } = data;

    // Calculate delta for stock update
    let delta = quantity;
    if (transactionType === "usage" || transactionType === "waste") {
      delta = -Math.abs(quantity);
    } else if (transactionType === "purchase") {
      delta = Math.abs(quantity);
    }
    // "adjustment" uses the raw quantity value as a delta (can be positive or negative)

    // 1. Insert Transaction
    const result = await db
      .insertInto("inventory_transactions")
      .values({
        ingredient_id: ingredientId,
        transaction_type: transactionType,
        quantity: quantity,
        cost_per_unit: costPerUnit,
        total_cost: totalCost,
        reference: reference,
        notes: notes,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // 2. Update Ingredient Stock & Price
    if (transactionType === "purchase" && currency && costPerUnit) {
      // Fetch current state to calculate Weighted Average Cost (WAC)
      const ingredient = await db
        .selectFrom("ingredients")
        .select(["current_stock", "price_per_unit"])
        .where("id", "=", ingredientId)
        .executeTakeFirstOrThrow();

      const oldStock = ingredient.current_stock || 0;
      const oldPrice = ingredient.price_per_unit || 0;
      const newStock = oldStock + delta;

      // WAC Formula: ((Old Stock * Old Price) + (New Quantity * New Price)) / New Total Stock
      // If newStock is 0 or less (shouldn't happen on purchase but safety first), use the new costPerUnit
      const calculatedWac =
        newStock > 0
          ? (oldStock * oldPrice + quantity * costPerUnit) / newStock
          : costPerUnit;
      const newWacPrice = Number(calculatedWac.toFixed(2));

      await db
        .updateTable("ingredients")
        .set({
          current_stock: newStock,
          price_per_unit: newWacPrice,
          currency: currency,
          last_updated: sql`CURRENT_TIMESTAMP`,
        })
        .where("id", "=", ingredientId)
        .execute();
    } else if (transactionType === "adjustment") {
      // Adjustment overwrites the current stock with the counted value
      await db
        .updateTable("ingredients")
        .set({
          current_stock: quantity,
          last_updated: sql`CURRENT_TIMESTAMP`,
        })
        .where("id", "=", ingredientId)
        .execute();
    } else {
      await db
        .updateTable("ingredients")
        .set((eb) => ({
          current_stock: eb("current_stock", "+", delta),
          last_updated: sql`CURRENT_TIMESTAMP`,
        }))
        .where("id", "=", ingredientId)
        .execute();
    }

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

    return rows.map((row) => ({
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

    return rows.map((row) => ({
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

  async getLowStockItems(): Promise<Ingredient[]> {
    const rows = await db
      .selectFrom("ingredients")
      .selectAll()
      .whereRef("current_stock", "<=", "min_stock_level")
      .orderBy(sql`(current_stock / NULLIF(min_stock_level, 0))`, "asc") // Prevent div by zero if min_stock is 0
      .execute();

    return rows.map(
      (row) =>
        ({
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
        }) as unknown as Ingredient,
    );
  }
}

export const inventoryRepository = new InventoryRepository();
