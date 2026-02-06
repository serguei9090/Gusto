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

    // Migration: Add currency column to ingredients if it doesn't exist
    try {
      await dbInstance.execute("ALTER TABLE ingredients ADD COLUMN currency TEXT DEFAULT 'USD'");
      console.log("➕ Added 'currency' column to ingredients table");
    } catch (e) {
      // Column probably already exists, ignore error
    }

    // Migration: Add currency column to recipes if it doesn't exist
    try {
      await dbInstance.execute("ALTER TABLE recipes ADD COLUMN currency TEXT DEFAULT 'USD'");
      console.log("➕ Added 'currency' column to recipes table");
    } catch (e) {
      // Column probably already exists
    }

    // Migration: Add account_number to suppliers
    try {
      await dbInstance.execute("ALTER TABLE suppliers ADD COLUMN account_number TEXT");
      console.log("➕ Added 'account_number' column to suppliers table");
    } catch (e) {
      // Column probably already exists
    }

    // Migration: Create prep_sheets table if it doesn't exist
    try {
      await dbInstance.execute(`
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
      console.log("➕ Ensured 'prep_sheets' table exists");
    } catch (e) {
      console.error("❌ Failed to create prep_sheets table:", e);
    }

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
        currency TEXT DEFAULT 'USD',
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
        currency TEXT DEFAULT 'USD',
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

    // Migration: Add Triggers for automatic stock management
    if (dbInstance) {
      const db = dbInstance;
      try {
        // Purchase increases stock
        await db.execute(`
          CREATE TRIGGER IF NOT EXISTS update_stock_after_purchase
          AFTER INSERT ON inventory_transactions
          FOR EACH ROW
          WHEN NEW.transaction_type = 'purchase'
          BEGIN
            UPDATE ingredients 
            SET current_stock = current_stock + NEW.quantity,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = NEW.ingredient_id;
          END;
        `);

        // Usage/Waste decreases stock
        await db.execute(`
          CREATE TRIGGER IF NOT EXISTS update_stock_after_usage
          AFTER INSERT ON inventory_transactions
          FOR EACH ROW
          WHEN NEW.transaction_type IN ('usage', 'waste')
          BEGIN
            UPDATE ingredients 
            SET current_stock = current_stock - NEW.quantity,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = NEW.ingredient_id;
          END;
        `);

        // Adjustment directly sets a delta (if we want to use quantity as delta)
        await db.execute(`
          CREATE TRIGGER IF NOT EXISTS update_stock_after_adjustment
          AFTER INSERT ON inventory_transactions
          FOR EACH ROW
          WHEN NEW.transaction_type = 'adjustment'
          BEGIN
            UPDATE ingredients 
            SET current_stock = current_stock + NEW.quantity,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = NEW.ingredient_id;
          END;
        `);

        console.log("⚡ Stock management triggers initialized");
      } catch (e) {
        console.error("❌ Failed to initialize triggers:", e);
      }
    }

    console.log("✅ Database schema initialized");
  }
}
