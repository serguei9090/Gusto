import type Database from "@tauri-apps/plugin-sql";
import { migrationRegistry } from "../migrationRegistry";

/**
 * Migration: Create Assets Table and Enhance Inventory Transactions
 * Date: 2026-02-13
 * Purpose: Add support for non-food inventory items (assets) and unified transaction tracking
 */

migrationRegistry.register({
  id: "20260213_create_assets_table",
  up: async (db: Database) => {
    console.log("📦 Creating assets table...");

    // 1. Create assets table (similar structure to ingredients but for non-food items)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit_of_measure TEXT NOT NULL,
        current_price REAL NOT NULL DEFAULT 0,
        price_per_unit REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        supplier_id INTEGER,
        min_stock_level REAL,
        current_stock REAL NOT NULL DEFAULT 0,
        last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        purchase_unit TEXT,
        conversion_ratio REAL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        asset_type TEXT DEFAULT 'operational',
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    console.log("✅ Assets table created");

    // 2. Add columns to inventory_transactions to support both ingredients and assets
    console.log("🔄 Enhancing inventory_transactions table...");

    // Check if columns already exist before adding
    const tableInfo = await db.select<Array<{ name: string }>>(
      "PRAGMA table_info(inventory_transactions)",
    );
    const columnNames = tableInfo.map((col) => col.name);

    if (!columnNames.includes("asset_id")) {
      await db.execute(`
        ALTER TABLE inventory_transactions ADD COLUMN asset_id INTEGER
      `);
      console.log("✅ Added asset_id column");
    }

    if (!columnNames.includes("item_type")) {
      await db.execute(`
        ALTER TABLE inventory_transactions ADD COLUMN item_type TEXT DEFAULT 'ingredient'
      `);
      console.log("✅ Added item_type column");
    }

    // 3. Make ingredient_id nullable (since we now have asset_id as alternative)
    // Note: SQLite doesn't support modifying column constraints directly
    // We'll handle this at the application level - either ingredient_id OR asset_id must be set

    console.log("✅ Migration 20260213_create_assets_table completed");
  },
});
