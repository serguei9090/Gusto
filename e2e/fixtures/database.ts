import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test as base } from "@playwright/test";
import Database from "better-sqlite3";
import { cleanDatabase, seedDatabase } from "./seed-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to test database - using a local file in the e2e directory
const DB_PATH = join(__dirname, "test.db");

export interface DatabaseFixture {
  /**
   * Execute raw SQL against the test database
   */
  exec: (sql: string) => void;

  /**
   * Seed the database with sample data
   */
  seed: () => void;

  /**
   * Clean all data from the database
   */
  clean: () => void;

  /**
   * Get direct database instance for advanced operations
   */
  db: Database.Database;
}

/**
 * Extended Playwright test with database fixture
 */
export const test = base.extend<{ database: DatabaseFixture }>({
  database: async (_, use) => {
    // Initialize database
    const db = new Database(DB_PATH);

    // Load schema
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    db.exec(schema);

    // Clean database before test
    cleanDatabase(db);

    // Seed with initial data
    seedDatabase(db);

    // Provide fixture to test
    await use({
      exec: (sql: string) => db.exec(sql),
      seed: () => seedDatabase(db),
      clean: () => cleanDatabase(db),
      db,
    });

    // Cleanup after test
    db.close();
  },
});

export { expect } from "@playwright/test";
