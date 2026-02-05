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
import type Database from "@tauri-apps/plugin-sql";
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

    createIntrospector(db: Kysely<any>): DatabaseIntrospector {
        return new SqliteIntrospector(db);
    }
}

class TauriSqliteDriver implements Driver {
    private db: Database | null = null;

    async init(): Promise<void> {
        this.db = await getDatabase();
    }

    async acquireConnection(): Promise<DatabaseConnection> {
        if (!this.db) {
            this.db = await getDatabase();
        }
        return new TauriSqliteConnection(this.db);
    }

    async beginTransaction(connection: DatabaseConnection): Promise<void> {
        await connection.executeQuery({
            sql: "BEGIN",
            parameters: [],
            query: { kind: "Unknown" } as any,
        } as any);
    }

    async commitTransaction(connection: DatabaseConnection): Promise<void> {
        await connection.executeQuery({
            sql: "COMMIT",
            parameters: [],
            query: { kind: "Unknown" } as any,
        } as any);
    }

    async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
        await connection.executeQuery({
            sql: "ROLLBACK",
            parameters: [],
            query: { kind: "Unknown" } as any,
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
    constructor(private db: Database) { }

    async executeQuery<R>(compiledQuery: {
        sql: string;
        parameters: readonly any[];
    }): Promise<QueryResult<R>> {
        const { sql, parameters } = compiledQuery;

        // Heuristic: If it starts with SELECT or contains RETURNING, use select()
        // Otherwise use execute()
        const lowerSql = sql.trim().toLowerCase();
        const isSelect = lowerSql.startsWith("select") || lowerSql.includes("returning");

        try {
            if (isSelect) {
                const rows = await this.db.select<R[]>(sql, [...parameters]);
                return {
                    rows,
                };
            } else {
                const result = await this.db.execute(sql, [...parameters]);

                // Safety checks for result properties
                const rowsAffected = result.rowsAffected ? BigInt(result.rowsAffected) : 0n;
                const insertId = result.lastInsertId ? BigInt(result.lastInsertId) : undefined;

                return {
                    // Cast alias for Kysely compatibility
                    numUpdatedOrDeletedRows: rowsAffected,
                    numInsertedOrUpdatedRows: rowsAffected,
                    insertId,
                    rows: [],
                } as any;
            }
        } catch (error) {
            console.error("Tauri Kysely Error:", error);
            throw error;
        }
    }

    async *streamQuery<R>(
        _compiledQuery: { sql: string; parameters: readonly any[] },
        _chunkSize: number
    ): AsyncIterableIterator<QueryResult<R>> {
        throw new Error("Streaming not supported by Tauri SQL plugin yet");
    }
}
