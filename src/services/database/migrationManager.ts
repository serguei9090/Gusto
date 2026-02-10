import type Database from "@tauri-apps/plugin-sql";
import { errorManager } from "../error/ErrorManager";

export interface Migration {
  id: string;
  up: (db: Database) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    id: "20240205_add_waste_buffer",
    up: async (db) => {
      await db.execute(
        "ALTER TABLE recipes ADD COLUMN waste_buffer_percentage REAL DEFAULT 0",
      );
    },
  },
  {
    id: "20240205_add_account_number_to_suppliers",
    up: async (db) => {
      await db.execute("ALTER TABLE suppliers ADD COLUMN account_number TEXT");
    },
  },
  {
    id: "20240205_add_currency_to_ingredients_and_recipes",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };
      await db
        .execute(
          "ALTER TABLE ingredients ADD COLUMN currency TEXT DEFAULT 'USD'",
        )
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN currency TEXT DEFAULT 'USD'")
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20240206_create_currency_tables",
    up: async (db) => {
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

      // Insert default currencies (only USD and EUR active by default)
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
        ('CUP', 'Cuban Peso', '₱', 2, 0)
      `);

      // Insert default exchange rates (USD as base)
      await db.execute(`
        INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, effective_date) VALUES
        ('USD', 'EUR', 0.92, CURRENT_DATE),
        ('USD', 'CUP', 500.0, CURRENT_DATE),
        ('EUR', 'USD', 1.087, CURRENT_DATE)
      `);

      // Set default base currency
      await db.execute(`
        INSERT OR IGNORE INTO app_settings (key, value) VALUES
        ('base_currency', 'USD')
      `);
    },
  },
  {
    id: "20240206_add_recipe_versioning",
    up: async (db) => {
      // Create recipe_versions table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS recipe_versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER NOT NULL,
          version_number INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          servings INTEGER NOT NULL,
          prep_time_minutes INTEGER,
          cooking_instructions TEXT,
          selling_price REAL,
          currency TEXT NOT NULL DEFAULT 'USD',
          target_cost_percentage REAL,
          waste_buffer_percentage REAL,
          total_cost REAL,
          profit_margin REAL,
          ingredients_snapshot TEXT NOT NULL,
          change_reason TEXT,
          change_notes TEXT,
          created_by TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          is_current INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
          UNIQUE(recipe_id, version_number)
        )
      `);

      // Add version tracking columns to recipes table
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };

      await db
        .execute(
          "ALTER TABLE recipes ADD COLUMN current_version INTEGER DEFAULT 1",
        )
        .catch(ignoreDuplicate);

      await db
        .execute("ALTER TABLE recipes ADD COLUMN last_version_date TEXT")
        .catch(ignoreDuplicate);

      // Create initial versions for existing recipes
      await db.execute(`
        INSERT INTO recipe_versions (
          recipe_id, version_number, name, description, category, servings,
          prep_time_minutes, cooking_instructions, selling_price, currency,
          target_cost_percentage, waste_buffer_percentage, total_cost, profit_margin,
          ingredients_snapshot, change_reason, created_by, is_current
        )
        SELECT 
          r.id,
          1,
          r.name,
          r.description,
          r.category,
          r.servings,
          r.prep_time_minutes,
          r.cooking_instructions,
          r.selling_price,
          r.currency,
          r.target_cost_percentage,
          r.waste_buffer_percentage,
          r.total_cost,
          r.profit_margin,
          COALESCE(
            (
              SELECT '[' || group_concat(
                '{"id":' || ri.id || 
                ',"ingredient_id":' || ri.ingredient_id || 
                ',"quantity":' || ri.quantity || 
                ',"unit":"' || ri.unit || '"' || 
                ',"cost":' || COALESCE(ri.cost, 0) || 
                ',"notes":"' || COALESCE(ri.notes, "") || '"}'
              ) || ']'
              FROM recipe_ingredients ri
              WHERE ri.recipe_id = r.id
            ),
            '[]'
          ),
          'Initial version',
          'system',
          1
        FROM recipes r
      `);

      // Update recipes with version info
      await db.execute(`
        UPDATE recipes 
        SET current_version = 1,
            last_version_date = CURRENT_TIMESTAMP
      `);
    },
  },
  {
    id: "20240209_add_allergen_and_nutritional_tracking",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };

      // Add columns to recipes table
      await db
        .execute("ALTER TABLE recipes ADD COLUMN allergens TEXT")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN dietary_restrictions TEXT")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN calories INTEGER")
        .catch(ignoreDuplicate);

      // Add columns to recipe_versions table
      await db
        .execute("ALTER TABLE recipe_versions ADD COLUMN allergens TEXT")
        .catch(ignoreDuplicate);
      await db
        .execute(
          "ALTER TABLE recipe_versions ADD COLUMN dietary_restrictions TEXT",
        )
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipe_versions ADD COLUMN calories INTEGER")
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20240209_add_unit_reconciliation_to_ingredients",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };

      await db
        .execute("ALTER TABLE ingredients ADD COLUMN purchase_unit TEXT")
        .catch(ignoreDuplicate);
      await db
        .execute(
          "ALTER TABLE ingredients ADD COLUMN conversion_ratio REAL DEFAULT 1",
        )
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20240209_add_recipe_experiments",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };

      await db
        .execute(
          "ALTER TABLE recipes ADD COLUMN is_experiment INTEGER DEFAULT 0",
        )
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN parent_recipe_id INTEGER")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN experiment_name TEXT")
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20240209_add_dynamic_configuration",
    up: async (db) => {
      // Create configuration table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS configuration_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          is_default INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(type, name)
        )
      `);

      // Seed Ingredient Categories
      const ingredientCategories = [
        "protein",
        "vegetable",
        "dairy",
        "spice",
        "grain",
        "fruit",
        "condiment",
        "other",
      ];
      for (const cat of ingredientCategories) {
        await db.execute(
          "INSERT OR IGNORE INTO configuration_items (type, name, is_default) VALUES ('ingredient_category', $1, 1)",
          [cat],
        );
      }

      // Seed Units of Measure
      const units = ["kg", "g", "l", "ml", "piece", "cup", "tbsp", "tsp", "lb"];
      for (const unit of units) {
        await db.execute(
          "INSERT OR IGNORE INTO configuration_items (type, name, is_default) VALUES ('unit', $1, 1)",
          [unit],
        );
      }

      // Seed Recipe Categories
      const recipeCategories = [
        "appetizer",
        "main",
        "dessert",
        "beverage",
        "side",
        "other",
      ];
      for (const cat of recipeCategories) {
        await db.execute(
          "INSERT OR IGNORE INTO configuration_items (type, name, is_default) VALUES ('recipe_category', $1, 1)",
          [cat],
        );
      }
    },
  },
  {
    id: "20240209_remove_stock_triggers",
    up: async (db) => {
      await db.execute("DROP TRIGGER IF EXISTS update_stock_after_purchase");
      await db.execute("DROP TRIGGER IF EXISTS update_stock_after_usage");
      await db.execute("DROP TRIGGER IF EXISTS update_stock_after_adjustment");
    },
  },
  {
    id: "20260209_add_is_active_to_ingredients",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };
      await db
        .execute(
          "ALTER TABLE ingredients ADD COLUMN is_active INTEGER DEFAULT 1",
        )
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20240209_add_config_order",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };
      await db
        .execute(
          "ALTER TABLE configuration_items ADD COLUMN order_index INTEGER",
        )
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20260210_add_sub_recipes",
    up: async (db) => {
      // 1. Recreate recipe_ingredients to support sub-recipes and make ingredient_id optional
      await db.execute(`
        CREATE TABLE IF NOT EXISTS recipe_ingredients_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER NOT NULL,
          ingredient_id INTEGER,
          sub_recipe_id INTEGER,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          cost REAL,
          notes TEXT,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
          FOREIGN KEY (sub_recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )
      `);

      // Check if table exists before copying (migration safety)
      const tableExists = await db.select<Array<{ name: string }>>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_ingredients'",
      );

      if (tableExists.length > 0) {
        await db.execute(`
          INSERT INTO recipe_ingredients_new (id, recipe_id, ingredient_id, quantity, unit, cost, notes)
          SELECT id, recipe_id, ingredient_id, quantity, unit, cost, notes FROM recipe_ingredients
        `);
        await db.execute("DROP TABLE recipe_ingredients");
      }

      await db.execute(
        "ALTER TABLE recipe_ingredients_new RENAME TO recipe_ingredients",
      );

      // 2. Add yield tracking to recipes for better sub-recipe costing
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };

      await db
        .execute("ALTER TABLE recipes ADD COLUMN yield_amount REAL")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN yield_unit TEXT")
        .catch(ignoreDuplicate);

      // Sync recipe_versions as well (just add the columns, snapshot logic will handle the rest)
      await db
        .execute("ALTER TABLE recipe_versions ADD COLUMN yield_amount REAL")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipe_versions ADD COLUMN yield_unit TEXT")
        .catch(ignoreDuplicate);
    },
  },
  {
    id: "20260211_move_units_to_db",
    up: async (db) => {
      // 1. Add is_active column
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };
      await db
        .execute(
          "ALTER TABLE configuration_items ADD COLUMN is_active INTEGER DEFAULT 1",
        )
        .catch(ignoreDuplicate);

      // 2. Define standard units
      const STANDARD_UNITS = {
        Mass: ["kg", "g", "mg", "lb", "oz"],
        Volume: [
          "l",
          "ml",
          "cl",
          "dl",
          "gal",
          "qt",
          "pt",
          "cup",
          "fl oz",
          "tbsp",
          "tsp",
          "dash",
          "pinch",
          "drop",
        ],
        Misc: [
          "pack",
          "bunch",
          "box",
          "case",
          "can",
          "bottle",
          "jar",
          "bag",
          "bundle",
          "roll",
        ],
        Length: ["m", "cm", "mm", "in", "ft", "yd"],
        Other: ["each", "piece"],
      };

      const UNIT_DISPLAY_ORDER: Record<string, string[]> = {
        mass: ["mg", "g", "oz", "lb", "kg"],
        volume: ["ml", "tsp", "tbsp", "cup", "pt", "qt", "l", "gal"],
        other: ["piece", "each"],
      };

      // 3. Migrate existing units to new type format (unit -> unit:category)
      // We'll iterate through all standard units and update/insert them.

      for (const [category, units] of Object.entries(STANDARD_UNITS)) {
        const type = `unit:${category.toLowerCase()}`;

        for (const unitName of units) {
          // Determine order index
          let orderIndex = 999;
          const orderList = UNIT_DISPLAY_ORDER[category.toLowerCase()];
          if (orderList) {
            const idx = orderList.indexOf(unitName);
            if (idx !== -1) orderIndex = idx;
          }

          // Update existing or insert new
          // First check if it exists with type='unit' (old format)
          await db.execute(
            `UPDATE configuration_items 
             SET type = $1, order_index = $2, is_active = 1
             WHERE name = $3 AND type = 'unit'`,
            [type, orderIndex, unitName],
          );

          // Now ensure it exists (upsert-ish)
          await db.execute(
            `INSERT INTO configuration_items (type, name, is_default, is_active, order_index)
             VALUES ($1, $2, 1, 1, $3)
             ON CONFLICT(type, name) DO UPDATE SET
             order_index = excluded.order_index,
             is_active = 1`,
            [type, unitName, orderIndex],
          );
        }
      }

      // 4. Clean up any remaining "unit" type items that weren't in standard list
      // We might want to keep them but move them to unit:misc?
      await db.execute(
        `UPDATE configuration_items 
         SET type = 'unit:misc' 
         WHERE type = 'unit'`,
      );
    },
  },
];

async function applyMigration(
  db: Database,
  migrationId: string,
  up: (db: Database) => Promise<void>,
) {
  console.log(`🚀 Attempting migration: ${migrationId}`);
  try {
    await up(db);
    await db.execute("INSERT INTO _migrations (id) VALUES ($1)", [migrationId]);
    console.log(`✅ Success: ${migrationId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("duplicate column name")) {
      console.log(
        `ℹ️ Column already exists, marking ${migrationId} as applied.`,
      );
      await db
        .execute("INSERT INTO _migrations (id) VALUES ($1)", [migrationId])
        .catch(() => {});
      return;
    }

    if (errorMessage.includes("UNIQUE constraint failed: _migrations.id")) {
      console.log(
        `ℹ️ Migration ${migrationId} already applied by another process.`,
      );
      return;
    }

    console.error(`❌ Migration failed: ${migrationId}`, error);
    errorManager.handleError(error, `MIGRATION_FAILURE: ${migrationId}`);
    throw error;
  }
}

export async function runMigrations(db: Database) {
  // 1. Create migrations table if not exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Get applied migrations
  const applied = await db.select<Array<{ id: string }>>(
    "SELECT id FROM _migrations",
  );
  const appliedIds = new Set(applied.map((m) => m.id));

  // 3. Run pending migrations
  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      await applyMigration(db, migration.id, migration.up);
    }
  }
}
