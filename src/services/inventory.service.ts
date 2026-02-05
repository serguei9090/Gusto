import { getDatabase } from "./database/client";
import type { InventoryTransaction, TransactionType } from "@/types/ingredient.types";

export interface CreateTransactionInput {
    ingredientId: number;
    transactionType: TransactionType;
    quantity: number;
    costPerUnit?: number | null;
    totalCost?: number | null;
    reference?: string | null;
    notes?: string | null;
}

class InventoryService {
    async logTransaction(data: CreateTransactionInput): Promise<InventoryTransaction> {
        const db = await getDatabase();

        // 1. Insert the transaction
        const result = await db.execute(
            `INSERT INTO inventory_transactions (
                ingredient_id, transaction_type, quantity, cost_per_unit, total_cost, reference, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                data.ingredientId,
                data.transactionType,
                data.quantity,
                data.costPerUnit || null,
                data.totalCost || null,
                data.reference || null,
                data.notes || null,
            ]
        );

        // 2. Update the ingredient's current stock
        // Purchase adds to stock, others subtract or replace depending on logic.
        // For Adjustment, usually quantity is the new total? Or the difference?
        // Let's assume quantity is the CHANGE (delta) for Purchase/Usage/Waste/Adjustment.
        // POSITIVE for addition, NEGATIVE for subtraction.

        let delta = data.quantity;
        if (data.transactionType === "usage" || data.transactionType === "waste") {
            delta = -Math.abs(data.quantity);
        } else if (data.transactionType === "purchase") {
            delta = Math.abs(data.quantity);
        }
        // Adjustment could be positive or negative depending on input.

        await db.execute(
            "UPDATE ingredients SET current_stock = current_stock + $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2",
            [delta, data.ingredientId]
        );

        // 3. Fetch and return the created transaction
        const transactions = await db.select<InventoryTransaction[]>(
            "SELECT * FROM inventory_transactions WHERE id = $1",
            [result.lastInsertId]
        );

        return transactions[0];
    }

    async getTransactionsByIngredient(ingredientId: number): Promise<InventoryTransaction[]> {
        const db = await getDatabase();
        return db.select<InventoryTransaction[]>(
            "SELECT * FROM inventory_transactions WHERE ingredient_id = $1 ORDER BY created_at DESC",
            [ingredientId]
        );
    }

    async getAllTransactions(limit = 50): Promise<InventoryTransaction[]> {
        const db = await getDatabase();
        return db.select<InventoryTransaction[]>(
            "SELECT * FROM inventory_transactions ORDER BY created_at DESC LIMIT $1",
            [limit]
        );
    }

    async getLowStockItems(): Promise<any[]> {
        const db = await getDatabase();
        return db.select<any[]>(
            "SELECT * FROM ingredients WHERE current_stock <= min_stock_level ORDER BY (current_stock / min_stock_level) ASC"
        );
    }
}

export const inventoryService = new InventoryService();
