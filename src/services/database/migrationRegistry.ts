import type Database from "@tauri-apps/plugin-sql";

export interface Migration {
  id: string;
  up: (db: Database) => Promise<void>;
}

class MigrationRegistry {
  private static instance: MigrationRegistry;
  private readonly migrations: Migration[] = [];

  private constructor() {}

  public static getInstance(): MigrationRegistry {
    if (!MigrationRegistry.instance) {
      MigrationRegistry.instance = new MigrationRegistry();
    }
    return MigrationRegistry.instance;
  }

  /**
   * Register a new migration.
   * Migrations are executed in the order they are registered.
   * Core migrations should be registered first.
   */
  public register(migration: Migration): void {
    if (this.migrations.some((m) => m.id === migration.id)) {
      console.warn(
        `Migration with id "${migration.id}" is already registered.`,
      );
      return;
    }
    this.migrations.push(migration);
  }

  /**
   * Get all registered migrations.
   */
  public getAll(): Migration[] {
    // Sort by ID to ensure deterministic execution (e.g. 20240101_...)
    return [...this.migrations].sort((a, b) => a.id.localeCompare(b.id));
  }
}

export const migrationRegistry = MigrationRegistry.getInstance();
