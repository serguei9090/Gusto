import { Kysely, SqliteAdapter, DummyDriver, SqliteQueryCompiler, SqliteIntrospector, type Dialect, type Driver, type DatabaseConnection, type QueryResult } from "kysely";
import Database from "@tauri-apps/plugin-sql";
import type { Database as DatabaseSchema } from "@/types/database";

// Define the shape of our database
export type DB = DatabaseSchema;

/**
 * Custom Tauri Driver for Kysely
 */
class TauriDriver implements Driver {
    async init(): Promise<void> { }

    async acquireConnection(): Promise<DatabaseConnection> {
        return new TauriConnection();
    }

    async beginTransaction(connection: DatabaseConnection) {
        await connection.executeQuery({ sql: "BEGIN", parameters: [] });
    }

    async commitTransaction(connection: DatabaseConnection) {
        await connection.executeQuery({ sql: "COMMIT", parameters: [] });
    }

    async rollbackTransaction(connection: DatabaseConnection) {
        await connection.executeQuery({ sql: "ROLLBACK", parameters: [] });
    }

    async releaseConnection() { }
    async destroy() { }
}

class TauriConnection implements DatabaseConnection {
    async executeQuery<R>(compiledQuery: { sql: string; parameters: readonly unknown[] }): Promise<QueryResult<R>> {
        try {
            // @ts-ignore - Tauri plugin SQL load
            const db = await Database.load("sqlite:restaurant.db");

            const isSelect = compiledQuery.sql.trim().toLowerCase().startsWith("select");

            if (isSelect) {
                const rows = await db.select(compiledQuery.sql, compiledQuery.parameters as any[]);
                return {
                    rows: rows as any[],
                };
            } else {
                const result = await db.execute(compiledQuery.sql, compiledQuery.parameters as any[]);
                return {
                    rows: [],
                    // @ts-ignore
                    numUpdatedOrDeletedRows: BigInt(result.rowsAffected),
                    // @ts-ignore
                    insertId: BigInt(result.lastInsertId)
                };
            }
        } catch (error) {
            console.error("Query Failed:", compiledQuery.sql, error);
            throw error;
        }
    }

    async *streamQuery() {
        throw new Error("Streaming not supported");
    }
}

class TauriDialect implements Dialect {
    createAdapter() {
        return new SqliteAdapter();
    }

    createDriver() {
        return new TauriDriver();
    }

    createQueryCompiler() {
        return new SqliteQueryCompiler();
    }

    createIntrospector(db: Kysely<any>) {
        return new SqliteIntrospector(db);
    }
}

// @ts-ignore
const isTauri = !!(typeof window !== "undefined" && window.__TAURI__);

// Mock Dialect for Browser Environment
const BrowserMockDialect: Dialect = {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new DummyDriver(),
    createQueryCompiler: () => new SqliteQueryCompiler(),
    createIntrospector: (db: Kysely<any>) => new SqliteIntrospector(db)
};

export const db = new Kysely<DatabaseSchema>({
    dialect: isTauri
        ? new TauriDialect()
        : BrowserMockDialect
});
