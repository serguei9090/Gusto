import type Database from "@tauri-apps/plugin-sql";

export const migration = {
  id: "002_add_currency_support",
  name: "Add Multi-Currency Support",
  up: async (db: Database) => {
    // Create currencies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS currencies (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        decimal_places INTEGER DEFAULT 2,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create exchange_rates table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        rate REAL NOT NULL,
        effective_date TEXT NOT NULL,
        source TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_currency) REFERENCES currencies(code),
        FOREIGN KEY (to_currency) REFERENCES currencies(code),
        UNIQUE(from_currency, to_currency, effective_date)
      )
    `);

    // Create app_settings table for base currency
    await db.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default currencies (Only USD and EUR active by default)
    await db.execute(`
      INSERT OR IGNORE INTO currencies (code, name, symbol, decimal_places, is_active) VALUES
      ('USD', 'US Dollar', '$', 2, 1),
      ('EUR', 'Euro', '€', 2, 1),
      ('GBP', 'British Pound', '£', 2, 0),
      ('CAD', 'Canadian Dollar', 'C$', 2, 0),
      ('AUD', 'Australian Dollar', 'A$', 2, 0),
      ('JPY', 'Japanese Yen', '¥', 0, 0),
      ('CNY', 'Chinese Yuan', '¥', 2, 0),
      ('INR', 'Indian Rupee', '₹', 2, 0),
      ('MXN', 'Mexican Peso', '$', 2, 0),
      ('BRL', 'Brazilian Real', 'R$', 2, 0)
    `);

    // Set default base currency
    await db.execute(`
      INSERT OR IGNORE INTO app_settings (key, value) VALUES
      ('base_currency', 'USD')
    `);

    // Insert default exchange rates (1:1 for USD as base)
    await db.execute(`
      INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, effective_date, source) VALUES
      ('USD', 'USD', 1.0, date('now'), 'system'),
      ('EUR', 'USD', 1.0, date('now'), 'default'),
      ('GBP', 'USD', 1.27, date('now'), 'default'),
      ('CAD', 'USD', 0.74, date('now'), 'default'),
      ('AUD', 'USD', 0.66, date('now'), 'default'),
      ('JPY', 'USD', 0.0067, date('now'), 'default'),
      ('CNY', 'USD', 0.14, date('now'), 'default'),
      ('INR', 'USD', 0.012, date('now'), 'default'),
      ('MXN', 'USD', 0.058, date('now'), 'default'),
      ('BRL', 'USD', 0.20, date('now'), 'default')
    `);

    console.log("✅ Migration 002: Multi-currency support added");
  },

  down: async (db: Database) => {
    await db.execute("DROP TABLE IF EXISTS exchange_rates");
    await db.execute("DROP TABLE IF EXISTS currencies");
    await db.execute("DELETE FROM app_settings WHERE key = 'base_currency'");
    console.log("✅ Migration 002: Multi-currency support removed");
  },
};
