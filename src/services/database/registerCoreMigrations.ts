import { migrationRegistry } from "./migrationRegistry";

/**
 * Register all core database migrations.
 * This should be called during app initialization.
 */
export function registerCoreMigrations() {
  migrationRegistry.register({
    id: "20240205_add_waste_buffer",
    up: async (db) => {
      await db.execute(
        "ALTER TABLE recipes ADD COLUMN waste_buffer_percentage REAL DEFAULT 0",
      );
    },
  });

  migrationRegistry.register({
    id: "20240205_add_account_number_to_suppliers",
    up: async (db) => {
      await db.execute("ALTER TABLE suppliers ADD COLUMN account_number TEXT");
    },
  });

  migrationRegistry.register({
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
  });

  migrationRegistry.register({
    id: "20240206_create_currency_tables",
    up: async (db) => {
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

      await db.execute(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

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

      await db.execute(`
        INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, effective_date) VALUES
        ('USD', 'EUR', 0.92, CURRENT_DATE),
        ('USD', 'CUP', 500.0, CURRENT_DATE),
        ('EUR', 'USD', 1.087, CURRENT_DATE)
      `);

      await db.execute(`
        INSERT OR IGNORE INTO app_settings (key, value) VALUES
        ('base_currency', 'USD')
      `);
    },
  });

  migrationRegistry.register({
    id: "20240206_add_recipe_versioning",
    up: async (db) => {
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

      await db.execute(`
        INSERT INTO recipe_versions (
          recipe_id, version_number, name, description, category, servings,
          prep_time_minutes, cooking_instructions, selling_price, currency,
          target_cost_percentage, waste_buffer_percentage, total_cost, profit_margin,
          ingredients_snapshot, change_reason, created_by, is_current
        )
        SELECT 
          r.id, 1, r.name, r.description, r.category, r.servings,
          r.prep_time_minutes, r.cooking_instructions, r.selling_price, r.currency,
          r.target_cost_percentage, r.waste_buffer_percentage, r.total_cost, r.profit_margin,
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
        WHERE NOT EXISTS (SELECT 1 FROM recipe_versions rv WHERE rv.recipe_id = r.id)
      `);

      await db.execute(`
        UPDATE recipes 
        SET current_version = 1,
            last_version_date = CURRENT_TIMESTAMP
        WHERE last_version_date IS NULL
      `);
    },
  });

  migrationRegistry.register({
    id: "20240209_add_allergen_and_nutritional_tracking",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };

      await db
        .execute("ALTER TABLE recipes ADD COLUMN allergens TEXT")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN dietary_restrictions TEXT")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipes ADD COLUMN calories INTEGER")
        .catch(ignoreDuplicate);

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
  });

  migrationRegistry.register({
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
  });

  migrationRegistry.register({
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
  });

  migrationRegistry.register({
    id: "20240209_add_dynamic_configuration",
    up: async (db) => {
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

      const units = ["kg", "g", "l", "ml", "piece", "cup", "tbsp", "tsp", "lb"];
      for (const unit of units) {
        await db.execute(
          "INSERT OR IGNORE INTO configuration_items (type, name, is_default) VALUES ('unit', $1, 1)",
          [unit],
        );
      }

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
  });

  migrationRegistry.register({
    id: "20240209_remove_stock_triggers",
    up: async (db) => {
      await db.execute("DROP TRIGGER IF EXISTS update_stock_after_purchase");
      await db.execute("DROP TRIGGER IF EXISTS update_stock_after_usage");
      await db.execute("DROP TRIGGER IF EXISTS update_stock_after_adjustment");
    },
  });

  migrationRegistry.register({
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
  });

  migrationRegistry.register({
    id: "20240209_z_add_config_order",
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
  });

  migrationRegistry.register({
    id: "20260210_add_sub_recipes",
    up: async (db) => {
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
      await db
        .execute("ALTER TABLE recipe_versions ADD COLUMN yield_amount REAL")
        .catch(ignoreDuplicate);
      await db
        .execute("ALTER TABLE recipe_versions ADD COLUMN yield_unit TEXT")
        .catch(ignoreDuplicate);
    },
  });

  migrationRegistry.register({
    id: "20260211_move_units_to_db",
    up: async (db) => {
      const ignoreDuplicate = (e: unknown) => {
        if (String(e).includes("duplicate column name")) return;
        throw e;
      };
      await db
        .execute(
          "ALTER TABLE configuration_items ADD COLUMN is_active INTEGER DEFAULT 1",
        )
        .catch(ignoreDuplicate);

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

      for (const [category, units] of Object.entries(STANDARD_UNITS)) {
        const type = `unit:${category.toLowerCase()}`;
        for (const unitName of units) {
          await db.execute(
            `UPDATE configuration_items SET type = $1, is_active = 1 WHERE name = $2 AND type = 'unit'`,
            [type, unitName],
          );
          await db.execute(
            `INSERT INTO configuration_items (type, name, is_default, is_active) VALUES ($1, $2, 1, 1) ON CONFLICT(type, name) DO UPDATE SET is_active = 1`,
            [type, unitName],
          );
        }
      }
      await db.execute(
        `UPDATE configuration_items SET type = 'unit:misc' WHERE type = 'unit'`,
      );
    },
  });
}
