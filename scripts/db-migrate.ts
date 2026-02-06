import { Database } from "bun:sqlite";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * CLI Migration Script for RestaurantManage using Bun's native SQLite
 * Run with: bun run scripts/db-migrate.ts [--path="path/to/db"]
 */

const DEFAULT_DB_PATH = join(
  homedir(),
  "AppData",
  "Roaming",
  "com.tauri.dev", // Using the identifier from tauri.conf.json
  "restaurant.db",
);

// Get path from args or use default
const args = process.argv.slice(2);
const pathArg = args.find((a) => a.startsWith("--path="))?.split("=")[1];
const dbPath = pathArg || DEFAULT_DB_PATH;

console.log(`🔍 Database Path: ${dbPath}`);

try {
  const db = new Database(dbPath);

  // 1. Create migrations table
  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = db.query("SELECT id FROM _migrations").all() as {
    id: string;
  }[];
  const appliedIds = new Set(applied.map((m) => m.id));

  const runMigration = (id: string, sql: string | string[]) => {
    if (appliedIds.has(id)) return;

    console.log(`🚀 Running migration: ${id}`);
    const statements = Array.isArray(sql) ? sql : [sql];

    try {
      const tx = db.transaction(() => {
        for (const s of statements) {
          db.run(s);
        }
        db.query("INSERT INTO _migrations (id) VALUES (?)").run(id);
      });

      tx();
      console.log(`✅ Success: ${id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("duplicate column name")) {
        console.log(`ℹ️ Column already exists, marking ${id} as applied.`);
        db.prepare("INSERT INTO _migrations (id) VALUES (?)").run(id);
      } else {
        console.error(`❌ Failed: ${id}`, err);
      }
    }
  };

  // --- MIGRATIONS LIST (Keep in sync with migrationManager.ts) ---

  runMigration(
    "20240205_add_waste_buffer",
    "ALTER TABLE recipes ADD COLUMN waste_buffer_percentage REAL DEFAULT 0",
  );

  runMigration(
    "20240205_add_account_number_to_suppliers",
    "ALTER TABLE suppliers ADD COLUMN account_number TEXT",
  );

  runMigration("20240205_add_currency_to_ingredients_and_recipes", [
    "ALTER TABLE ingredients ADD COLUMN currency TEXT DEFAULT 'USD'",
    "ALTER TABLE recipes ADD COLUMN currency TEXT DEFAULT 'USD'",
  ]);

  console.log("🏁 Migration process finished.");
  db.close();
} catch (error) {
  console.error("💀 Fatal Error:", error);
  process.exit(1);
}
