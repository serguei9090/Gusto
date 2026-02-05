import { getDatabase } from "./database/client";

export interface DashboardSummary {
    totalInventoryValue: number;
    lowStockCount: number;
    recipeCount: number;
    avgProfitMargin: number;
    totalActiveSuppliers: number;
}

export interface UrgentReorderItem {
    id: number;
    name: string;
    currentStock: number;
    minStockLevel: number;
    unit: string;
    deficit: number;
}

class DashboardService {
    async getSummary(): Promise<DashboardSummary> {
        const db = await getDatabase();

        // 1. Total Inventory Value
        const valResult = await db.select<any[]>(
            "SELECT SUM(current_stock * price_per_unit) as total FROM ingredients"
        );

        // 2. Low Stock Count
        const lowResult = await db.select<any[]>(
            "SELECT COUNT(*) as count FROM ingredients WHERE current_stock <= min_stock_level"
        );

        // 3. Recipe Stats
        const recipeResult = await db.select<any[]>(
            "SELECT COUNT(*) as count, AVG(profit_margin) as avg_margin FROM recipes"
        );

        // 4. Supplier Count
        const supplierResult = await db.select<any[]>(
            "SELECT COUNT(*) as count FROM suppliers"
        );

        return {
            totalInventoryValue: valResult[0]?.total || 0,
            lowStockCount: lowResult[0]?.count || 0,
            recipeCount: recipeResult[0]?.count || 0,
            avgProfitMargin: recipeResult[0]?.avg_margin || 0,
            totalActiveSuppliers: supplierResult[0]?.count || 0,
        };
    }

    async getUrgentReorders(limit = 5): Promise<UrgentReorderItem[]> {
        const db = await getDatabase();
        const results = await db.select<any[]>(
            `SELECT id, name, current_stock, min_stock_level, unit_of_measure, 
             (min_stock_level - current_stock) as deficit
             FROM ingredients 
             WHERE current_stock < min_stock_level 
             ORDER BY deficit DESC 
             LIMIT $1`,
            [limit]
        );

        return results.map(r => ({
            id: r.id,
            name: r.name,
            currentStock: r.current_stock,
            minStockLevel: r.min_stock_level,
            unit: r.unit_of_measure,
            deficit: r.deficit
        }));
    }

    async getTopRecipes(limit = 5): Promise<any[]> {
        const db = await getDatabase();
        return db.select<any[]>(
            "SELECT name, profit_margin, selling_price FROM recipes ORDER BY profit_margin DESC LIMIT $1",
            [limit]
        );
    }
}

export const dashboardService = new DashboardService();
