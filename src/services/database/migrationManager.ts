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
];

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
      console.log(`🚀 Attempting migration: ${migration.id}`);
      try {
        await migration.up(db);
        await db.execute("INSERT INTO _migrations (id) VALUES ($1)", [
          migration.id,
        ]);
        console.log(`✅ Success: ${migration.id}`);
      } catch (error) {
        // Handle case where column might already exist (e.g. from transition period)
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("duplicate column name")) {
          console.log(
            `ℹ️ Column already exists, marking ${migration.id} as applied.`,
          );
          await db.execute("INSERT INTO _migrations (id) VALUES ($1)", [
            migration.id,
          ]);
        } else {
          console.error(`❌ Migration failed: ${migration.id}`, error);
          errorManager.handleError(error, `MIGRATION_FAILURE: ${migration.id}`);
          throw error;
        }
      }
    }
  }
}
