import Database from "@tauri-apps/plugin-sql";

// Singleton instance
let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  try {
    // Initial connection
    dbInstance = await Database.load("sqlite:restaurant.db");
    console.log("✅ Database connected via Tauri SQL plugin");

    // Initialize schema
    await initSchema(dbInstance);

    return dbInstance;
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw error;
  }
}

async function initSchema(db: Database) {
  // Check if tables exist
  const result = await db.select<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients'",
  );

  if (result.length === 0) {
    console.log("📝 Initializing database schema...");

    // Enable foreign keys
    await db.execute("PRAGMA foreign_keys = ON");

    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        payment_terms TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit_of_measure TEXT NOT NULL,
        current_price REAL NOT NULL,
        price_per_unit REAL NOT NULL,
        supplier_id INTEGER,
        min_stock_level REAL,
        current_stock REAL DEFAULT 0,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        servings INTEGER NOT NULL,
        prep_time_minutes INTEGER,
        cooking_instructions TEXT,
        selling_price REAL,
        target_cost_percentage REAL,
        total_cost REAL,
        profit_margin REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        cost REAL,
        notes TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        cost_per_unit REAL,
        total_cost REAL,
        reference TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER NOT NULL,
        price REAL NOT NULL,
        supplier_id INTEGER,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS prep_sheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        shift TEXT,
        prep_cook_name TEXT,
        notes TEXT,
        recipes_json TEXT NOT NULL,
        items_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database schema initialized");
  }
}
