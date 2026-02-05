import { getDatabase } from "./database/client";
import type {
    Ingredient,
    CreateIngredientInput,
    UpdateIngredientInput,
} from "@/types/ingredient.types";

export class IngredientService {
    /**
     * Create a new ingredient
     */
    async create(data: CreateIngredientInput): Promise<Ingredient> {
        const db = await getDatabase();

        // Prepare values
        const values = [
            data.name,
            data.category,
            data.unitOfMeasure,
            data.currentPrice,
            data.pricePerUnit,
            data.supplierId || null,
            data.minStockLevel || null,
            data.currentStock || 0,
            data.notes || null
        ];

        const result = await db.execute(
            `INSERT INTO ingredients (
        name, category, unit_of_measure, current_price, price_per_unit, 
        supplier_id, min_stock_level, current_stock, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            values
        );

        // Fetch the created record
        if (result.lastInsertId === undefined) {
            throw new Error("Failed to create ingredient: No ID returned");
        }

        const created = await this.getById(result.lastInsertId);
        if (!created) throw new Error("Failed to create ingredient");

        return created;
    }

    /**
     * Get ingredient by ID
     */
    async getById(id: number): Promise<Ingredient | null> {
        const db = await getDatabase();
        const result = await db.select<Ingredient[]>(
            "SELECT * FROM ingredients WHERE id = $1",
            [id]
        );

        return result.length > 0 ? this.mapRowToIngredient(result[0]) : null;
    }

    /**
     * Get all ingredients
     */
    async getAll(): Promise<Ingredient[]> {
        const db = await getDatabase();
        const result = await db.select<Ingredient[]>(
            "SELECT * FROM ingredients ORDER BY name ASC"
        );

        return result.map(this.mapRowToIngredient);
    }

    /**
     * Update ingredient
     */
    async update(
        id: number,
        data: UpdateIngredientInput
    ): Promise<Ingredient | null> {
        const db = await getDatabase();

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.category !== undefined) {
            updates.push(`category = $${paramIndex++}`);
            values.push(data.category);
        }
        if (data.unitOfMeasure !== undefined) {
            updates.push(`unit_of_measure = $${paramIndex++}`);
            values.push(data.unitOfMeasure);
        }
        if (data.currentPrice !== undefined) {
            updates.push(`current_price = $${paramIndex++}`);
            values.push(data.currentPrice);
        }
        if (data.pricePerUnit !== undefined) {
            updates.push(`price_per_unit = $${paramIndex++}`);
            values.push(data.pricePerUnit);
        }
        if (data.currentStock !== undefined) {
            updates.push(`current_stock = $${paramIndex++}`);
            values.push(data.currentStock);
        }
        if (data.minStockLevel !== undefined) {
            updates.push(`min_stock_level = $${paramIndex++}`);
            values.push(data.minStockLevel);
        }
        if (data.supplierId !== undefined) {
            updates.push(`supplier_id = $${paramIndex++}`);
            values.push(data.supplierId);
        }
        if (data.notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(data.notes);
        }

        if (updates.length === 0) return this.getById(id);

        updates.push(`last_updated = CURRENT_TIMESTAMP`);
        values.push(id);

        await db.execute(
            `UPDATE ingredients SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
            values
        );

        return this.getById(id);
    }

    /**
     * Delete ingredient
     */
    async delete(id: number): Promise<boolean> {
        const db = await getDatabase();
        const result = await db.execute("DELETE FROM ingredients WHERE id = $1", [id]);
        return result.rowsAffected > 0;
    }

    /**
     * Search ingredients by name
     */
    async search(query: string): Promise<Ingredient[]> {
        const db = await getDatabase();
        const result = await db.select<Ingredient[]>(
            "SELECT * FROM ingredients WHERE name LIKE $1 ORDER BY name ASC",
            [`%${query}%`]
        );
        return result.map(this.mapRowToIngredient);
    }

    /**
     * Get ingredients with low stock
     */
    async getLowStock(): Promise<Ingredient[]> {
        const db = await getDatabase();
        const result = await db.select<Ingredient[]>(
            "SELECT * FROM ingredients WHERE current_stock < min_stock_level AND min_stock_level IS NOT NULL"
        );
        return result.map(this.mapRowToIngredient);
    }

    /**
     * Helper to map database row to Ingredient type
     * (Handles camelCase conversion if needed, though we used snake_case in DB)
     */
    private mapRowToIngredient(row: any): Ingredient {
        return {
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
            notes: row.notes
        };
    }
}

// Export singleton instance
export const ingredientService = new IngredientService();
