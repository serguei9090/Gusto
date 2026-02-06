import type Database from "@tauri-apps/plugin-sql";
import {
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type DialectAdapter,
  type Driver,
  type Kysely,
  type QueryCompiler,
  type QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from "kysely";
import { getDatabase } from "@/services/database/client";

/**
 * Kysely Dialect for Tauri SQL Plugin (SQLite)
 */
export class TauriSqliteDialect implements Dialect {
  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  createDriver(): Driver {
    return new TauriSqliteDriver();
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }

  createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }
}

class TauriSqliteDriver implements Driver {
  private db: Database | null = null;

  async init(): Promise<void> {
    this.db = await getDatabase();
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    this.db ??= await getDatabase();
    return new TauriSqliteConnection(this.db);
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery({
      sql: "BEGIN",
      parameters: [],
      // biome-ignore lint/suspicious/noExplicitAny: Kysely internal interface
      query: { kind: "Unknown" } as any,
      // biome-ignore lint/suspicious/noExplicitAny: Kysely internal interface
    } as any);
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery({
      sql: "COMMIT",
      parameters: [],
      // biome-ignore lint/suspicious/noExplicitAny: Kysely internal interface
      query: { kind: "Unknown" } as any,
      // biome-ignore lint/suspicious/noExplicitAny: Kysely internal interface
    } as any);
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery({
      sql: "ROLLBACK",
      parameters: [],
      // biome-ignore lint/suspicious/noExplicitAny: Kysely internal interface
      query: { kind: "Unknown" } as any,
      // biome-ignore lint/suspicious/noExplicitAny: Kysely internal interface
    } as any);
  }

  async releaseConnection(_connection: DatabaseConnection): Promise<void> {
    // No-op for single connection
  }

  async destroy(): Promise<void> {
    // No explicit close needed for tauri plugin usually
  }
}

class TauriSqliteConnection implements DatabaseConnection {
  constructor(private readonly db: Database) {}

  async executeQuery<R>(compiledQuery: {
    sql: string;
    parameters: readonly unknown[];
  }): Promise<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;

    // Heuristic: If it starts with SELECT or contains RETURNING, use select()
    // Otherwise use execute()
    const lowerSql = sql.trim().toLowerCase();
    const isSelect =
      lowerSql.startsWith("select") || lowerSql.includes("returning");

    try {
      if (isSelect) {
        const rows = await this.db.select<R[]>(sql, [...parameters]);
        return {
          rows,
        };
      } else {
        const result = await this.db.execute(sql, [...parameters]);

        // Safety checks for result properties
        const rowsAffected = result.rowsAffected
          ? BigInt(result.rowsAffected)
          : 0n;
        const insertId = result.lastInsertId
          ? BigInt(result.lastInsertId)
          : undefined;

        return {
          numUpdatedOrDeletedRows: rowsAffected,
          numInsertedOrUpdatedRows: rowsAffected,
          insertId,
          rows: [],
        } as QueryResult<R>;
      }
    } catch (error) {
      console.error("Tauri Kysely Error:", error);
      throw error;
    }
  }

  // biome-ignore lint/correctness/useYield: Streaming not supported by Tauri SQL plugin yet
  async *streamQuery<R>(
    _compiledQuery: { sql: string; parameters: readonly unknown[] },
    _chunkSize: number,
  ): AsyncIterableIterator<QueryResult<R>> {
    throw new Error("Streaming not supported by Tauri SQL plugin yet");
  }
}
