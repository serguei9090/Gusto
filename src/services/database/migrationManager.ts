import type Database from "@tauri-apps/plugin-sql";
import { errorManager } from "../error/ErrorManager";
import { migrationRegistry } from "./migrationRegistry";

/**
 * Migration service to apply pending database schema changes.
 * Pulls migrations from the MigrationRegistry.
 */

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

  // 3. Run pending migrations from registry
  const migrations = migrationRegistry.getAll();
  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      await applyMigration(db, migration.id, migration.up);
    }
  }
}
