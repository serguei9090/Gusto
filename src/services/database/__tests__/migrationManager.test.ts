import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorManager } from "../../error/ErrorManager";
import { runMigrations } from "../migrationManager";
import { type Migration, migrationRegistry } from "../migrationRegistry";

// Mock dependencies
vi.mock("../migrationRegistry", () => ({
  migrationRegistry: {
    getAll: vi.fn(),
  },
}));

vi.mock("../../error/ErrorManager", () => ({
  errorManager: {
    handleError: vi.fn(),
  },
}));

describe("MigrationManager", () => {
  // biome-ignore lint/suspicious/noExplicitAny: Simplified mock for testing
  let dbMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    dbMock = {
      execute: vi.fn().mockResolvedValue({}),
      select: vi.fn().mockResolvedValue([]),
    };
  });

  it("should create migrations table and run pending migrations", async () => {
    const migrations = [
      { id: "M1", up: vi.fn().mockResolvedValue({}) },
      { id: "M2", up: vi.fn().mockResolvedValue({}) },
    ];
    vi.mocked(migrationRegistry.getAll).mockReturnValue(
      migrations as Migration[],
    );
    dbMock.select.mockResolvedValue([]); // No migrations applied yet

    await runMigrations(dbMock);

    expect(dbMock.execute).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS _migrations"),
    );
    expect(migrations[0].up).toHaveBeenCalled();
    expect(migrations[1].up).toHaveBeenCalled();
    expect(dbMock.execute).toHaveBeenCalledWith(
      "INSERT INTO _migrations (id) VALUES ($1)",
      ["M1"],
    );
    expect(dbMock.execute).toHaveBeenCalledWith(
      "INSERT INTO _migrations (id) VALUES ($1)",
      ["M2"],
    );
  });

  it("should skip already applied migrations", async () => {
    const migrations = [
      { id: "M1", up: vi.fn().mockResolvedValue({}) },
      { id: "M2", up: vi.fn().mockResolvedValue({}) },
    ];
    vi.mocked(migrationRegistry.getAll).mockReturnValue(
      migrations as Migration[],
    );
    dbMock.select.mockResolvedValue([{ id: "M1" }]); // M1 already applied

    await runMigrations(dbMock);

    expect(migrations[0].up).not.toHaveBeenCalled();
    expect(migrations[1].up).toHaveBeenCalled();
    expect(dbMock.execute).not.toHaveBeenCalledWith(
      "INSERT INTO _migrations (id) VALUES ($1)",
      ["M1"],
    );
    expect(dbMock.execute).toHaveBeenCalledWith(
      "INSERT INTO _migrations (id) VALUES ($1)",
      ["M2"],
    );
  });

  it("should handle 'duplicate column name' error as success", async () => {
    const migrations = [
      {
        id: "M1",
        up: vi.fn().mockRejectedValue(new Error("duplicate column name: test")),
      },
    ];
    vi.mocked(migrationRegistry.getAll).mockReturnValue(
      migrations as Migration[],
    );
    dbMock.select.mockResolvedValue([]);

    await runMigrations(dbMock);

    expect(dbMock.execute).toHaveBeenCalledWith(
      "INSERT INTO _migrations (id) VALUES ($1)",
      ["M1"],
    );
    expect(errorManager.handleError).not.toHaveBeenCalled();
  });

  it("should handle UNIQUE constraint failure (already applied) silently", async () => {
    const migrations = [
      {
        id: "M1",
        up: vi
          .fn()
          .mockRejectedValue(
            new Error("UNIQUE constraint failed: _migrations.id"),
          ),
      },
    ];
    vi.mocked(migrationRegistry.getAll).mockReturnValue(
      migrations as Migration[],
    );
    dbMock.select.mockResolvedValue([]);

    await runMigrations(dbMock);

    // Should return silently
    expect(errorManager.handleError).not.toHaveBeenCalled();
  });

  it("should fail and log error on other migration failures", async () => {
    const migrations = [
      { id: "M1", up: vi.fn().mockRejectedValue(new Error("Fatal error")) },
    ];
    vi.mocked(migrationRegistry.getAll).mockReturnValue(
      migrations as Migration[],
    );
    dbMock.select.mockResolvedValue([]);

    await expect(runMigrations(dbMock)).rejects.toThrow("Fatal error");
    expect(errorManager.handleError).toHaveBeenCalled();
  });
});
