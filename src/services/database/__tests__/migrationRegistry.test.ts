import { beforeEach, describe, expect, it } from "vitest";
import { migrationRegistry } from "../migrationRegistry";

describe("MigrationRegistry", () => {
  beforeEach(() => {
    // Reset private state since it's a singleton
    // @ts-expect-error - accessing private member for testing
    migrationRegistry.migrations = [];
  });

  it("should register a migration", () => {
    const migration = {
      id: "20240101_initial",
      up: async () => {},
    };
    migrationRegistry.register(migration);
    expect(migrationRegistry.getAll()).toHaveLength(1);
    expect(migrationRegistry.getAll()[0].id).toBe(migration.id);
  });

  it("should not register duplicate migrations", () => {
    const migration = {
      id: "20240101_initial",
      up: async () => {},
    };
    migrationRegistry.register(migration);
    migrationRegistry.register(migration);
    expect(migrationRegistry.getAll()).toHaveLength(1);
  });

  it("should return migrations sorted by ID", () => {
    migrationRegistry.register({ id: "20240201", up: async () => {} });
    migrationRegistry.register({ id: "20240101", up: async () => {} });
    migrationRegistry.register({ id: "20240301", up: async () => {} });

    const all = migrationRegistry.getAll();
    expect(all[0].id).toBe("20240101");
    expect(all[1].id).toBe("20240201");
    expect(all[2].id).toBe("20240301");
  });
});
