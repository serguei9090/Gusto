import Database from "@tauri-apps/plugin-sql";
import {
    type DatabaseConnection,
    type Dialect,
    type Driver,
    type Driver,
    Kysely,
    type QueryResult,
    SqliteAdapter,
    SqliteIntrospector,
    SqliteQueryCompiler,
} from "kysely";
import type { Database as DatabaseSchema } from "@/types/database";

// Define the shape of our database
export type DB = DatabaseSchema;

/**
 * Custom Tauri Driver for Kysely
 */
// Helper to mimic CompiledQuery for internal transaction calls
const rawQuery = (sql: string): any => ({
    sql,
    parameters: [],
    query: { kind: "RawNode" } as any, // Fake QueryNode
    queryId: "",
});

class TauriDriver implements Driver {
    async init(): Promise<void> { }

    async acquireConnection(): Promise<DatabaseConnection> {
        return new TauriConnection();
    }

    async beginTransaction(connection: DatabaseConnection) {
        await connection.executeQuery(rawQuery("BEGIN"));
    }

    async commitTransaction(connection: DatabaseConnection) {
        await connection.executeQuery(rawQuery("COMMIT"));
    }

    async rollbackTransaction(connection: DatabaseConnection) {
        await connection.executeQuery(rawQuery("ROLLBACK"));
    }

    async releaseConnection() { }
    async destroy() { }
}

class TauriConnection implements DatabaseConnection {
    async executeQuery<R>(compiledQuery: {
        sql: string;
        parameters: readonly unknown[];
    }): Promise<QueryResult<R>> {
        try {
            // @ts-expect-error - Tauri plugin SQL load
            const db = await Database.load("sqlite:restaurant.db");

            const isSelect = compiledQuery.sql
                .trim()
                .toLowerCase()
                .startsWith("select");

            if (isSelect) {
                const rows = await db.select(
                    compiledQuery.sql,
                    compiledQuery.parameters as any[],
                );
                return {
                    rows: rows as any[],
                };
            } else {
                const result = await db.execute(
                    compiledQuery.sql,
                    compiledQuery.parameters as any[],
                );
                return {
                    rows: [],
                    // @ts-expect-error
                    numUpdatedOrDeletedRows: BigInt(result.rowsAffected),
                    // @ts-expect-error
                    insertId: BigInt(result.lastInsertId),
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

// @ts-expect-error
const isTauri = !!(typeof window !== "undefined" && window.__TAURI__);

// Mock Driver for Browser/E2E Environment (No Tauri)
class MockBrowserDriver implements Driver {
    async init(): Promise<void> { }
    async acquireConnection(): Promise<DatabaseConnection> {
        return new MockBrowserConnection();
    }
    async beginTransaction(_connection: DatabaseConnection) { }
    async commitTransaction(_connection: DatabaseConnection) { }
    async rollbackTransaction(_connection: DatabaseConnection) { }
    async releaseConnection() { }
    async destroy() { }
}

class MockBrowserConnection implements DatabaseConnection {
    async executeQuery<R>(compiledQuery: {
        sql: string;
        parameters: readonly unknown[];
    }): Promise<QueryResult<R>> {
        console.log("[MockDB] Executing:", compiledQuery.sql, compiledQuery.parameters);

        const lowerSql = compiledQuery.sql.toLowerCase();

        if (lowerSql.startsWith("select")) {
            return { rows: [] as any };
        }

        return {
            rows: [],
            // @ts-ignore: Fake return for mock
            numUpdatedOrDeletedRows: BigInt(1),
            // @ts-ignore: Fake return for mock
            insertId: BigInt(Date.now()),
        } as any;
    }

    async *streamQuery() { throw new Error("Stream not supported in mock"); }
}

const BrowserMockDialect: Dialect = {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new MockBrowserDriver(),
    createQueryCompiler: () => new SqliteQueryCompiler(),
    createIntrospector: (db: Kysely<any>) => new SqliteIntrospector(db),
};

export const db = new Kysely<DatabaseSchema>({
    dialect: isTauri ? new TauriDialect() : BrowserMockDialect,
});
