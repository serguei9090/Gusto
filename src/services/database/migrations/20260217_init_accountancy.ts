import type { Migration } from "../migrationRegistry";

export const initAccountancyMigration: Migration = {
  id: "20260217_init_accountancy",
  up: async (db) => {
    console.log("💰 Initializing Accountancy Module Schema...");

    // 1. Tax Rates
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tax_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rate REAL NOT NULL, -- Stored as decimal (e.g., 0.10 for 10%)
        type TEXT NOT NULL DEFAULT 'VAT', -- VAT, GST, SERVICE, LUXURY
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Tax Maps (Many-to-Many Recipe <-> Tax)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tax_maps (
        recipe_id INTEGER NOT NULL,
        tax_id INTEGER NOT NULL,
        PRIMARY KEY (recipe_id, tax_id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (tax_id) REFERENCES tax_rates(id) ON DELETE CASCADE
      )
    `);

    // 3. Expense Ledger (Non-Ingredient Costs)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS expense_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL DEFAULT CURRENT_DATE,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL, -- RENT, UTILITY, ADMIN, LABOR, MARKETING
        reference_number TEXT,
        is_recurring INTEGER DEFAULT 0,
        frequency TEXT, -- MONTHLY, WEEKLY
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Recipe Financials (Extension of Recipes table for advanced costing)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipe_financials (
        recipe_id INTEGER PRIMARY KEY,
        labor_cost REAL DEFAULT 0, -- Calculated from DL
        variable_overhead REAL DEFAULT 0, -- Calculated from Utility Burn Rate
        fixed_overhead REAL DEFAULT 0, -- Allocations
        prime_cost REAL DEFAULT 0, -- RM + DL
        total_plate_cost REAL DEFAULT 0, -- Prime + Overheads
        last_calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `);

    // 5. Default Settings
    await db.execute(`
      INSERT OR IGNORE INTO app_settings (key, value) VALUES
      ('labor_rate_hourly', '15.0'),
      ('utility_burn_rate_min', '0.05'),
      ('fixed_overhead_percent', '0.10')
    `);

    console.log("✅ Accountancy Schema Initialized.");
  },
};
