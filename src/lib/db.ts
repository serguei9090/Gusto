import { Kysely } from "kysely";
import { TauriSqliteDialect } from "./tauri-kysely";
import { mockDb } from "./db.browser";

// Environment detection
// In Tauri v2, window.__TAURI__ is often disabled by default. 
// window.__TAURI_IPC__ is a more reliable check for the presence of the Tauri bridge.
const isTauri = typeof window !== 'undefined' && (
    '__TAURI__' in window ||
    '__TAURI_IPC__' in window ||
    '__TAURI_METADATA__' in window ||
    '__TAURI_INTERNALS__' in window ||
    (window as any).rpc !== undefined ||
    navigator.userAgent.includes('Tauri')
);

/**
 * Synchronous database access for immediate use
 * In Tauri mode, this will initially return mock until initialized
 * Use getDb() for guaranteed real database access
 */
// biome-ignore lint/suspicious/noExplicitAny: Mock DB is any
// biome-ignore lint/style/noVar: Mutable export required for live binding swap
export let db: any = mockDb;

/**
 * Initialize database at app startup
 * Call this in your app's main entry point
 */
export async function initDb(): Promise<void> {
    console.log("🔍 Checking environment...", {
        isTauri,
        hasWindow: typeof window !== 'undefined',
        tauriInWindow: typeof window !== 'undefined' && '__TAURI__' in window,
        ipcInWindow: typeof window !== 'undefined' && '__TAURI_IPC__' in window,
        metadataInWindow: typeof window !== 'undefined' && '__TAURI_METADATA__' in window
    });

    if (isTauri) {
        try {
            console.log("📝 Initializing Tauri Kysely...");
            const kdb = new Kysely<any>({
                dialect: new TauriSqliteDialect(),
            });

            db = kdb;
            console.log("✅ Database initialized (Tauri mode)");
        } catch (error) {
            console.error("❌ Database initialization failed:", error);
        }
    } else {
        console.log("⚠️  Using mock database (Browser mode)");
    }
}

export const isRealDatabase = isTauri;
export const isMockDatabase = !isTauri;
