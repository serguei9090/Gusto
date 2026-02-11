import { Kysely } from "kysely";
import type { Database } from "@/types/db.types";
import { mockDb } from "./db.browser";
import { TauriSqliteDialect } from "./tauri-kysely";

// Environment detection
// In Tauri v2, window.__TAURI__ is often disabled by default.
// window.__TAURI_IPC__ is a more reliable check for the presence of the Tauri bridge.
const isTauri =
  globalThis.window !== undefined &&
  ("__TAURI__" in globalThis.window ||
    "__TAURI_IPC__" in globalThis.window ||
    "__TAURI_METADATA__" in globalThis.window ||
    "__TAURI_INTERNALS__" in globalThis.window ||
    // biome-ignore lint/suspicious/noExplicitAny: Tauri internal window property
    "rpc" in (globalThis.window as any) ||
    navigator.userAgent.includes("Tauri"));

/**
 * Internal database instance
 * Use getDb() to access the database
 */
// biome-ignore lint/suspicious/noExplicitAny: Mock DB or Kysely instance
let dbInstance: Kysely<Database> = mockDb as any;

import { errorManager } from "@/services/error/ErrorManager";

/**
 * Get the current database instance
 * This is the recommended way to access the database
 */
export function getDb(): Kysely<Database> {
  return dbInstance;
}

/**
 * @deprecated Use getDb() instead. Direct db export will be removed in a future version.
 * Backward compatibility export - this allows existing code to continue working
 */
export const db = new Proxy({} as Kysely<Database>, {
  get(_target, prop) {
    // We must use Reflect.get and provide dbInstance as the receiver.
    // Also, we must bind functions to dbInstance.
    // This is required because Kysely uses true JS private fields (#fields).
    // Accessing a private field on a Proxy will throw a TypeError unless 'this' is the original instance.
    const value = Reflect.get(dbInstance, prop, dbInstance);
    if (typeof value === "function") {
      return value.bind(dbInstance);
    }
    return value;
  },
});

/**
 * Initialize database at app startup
 * Call this in your app's main entry point
 */
export async function initDb(): Promise<void> {
  console.log("🔍 Checking environment...", {
    isTauri,
    hasWindow: globalThis.window !== undefined,
    tauriInWindow:
      globalThis.window !== undefined && "__TAURI__" in globalThis.window,
    ipcInWindow:
      globalThis.window !== undefined && "__TAURI_IPC__" in globalThis.window,
    metadataInWindow:
      globalThis.window !== undefined &&
      "__TAURI_METADATA__" in globalThis.window,
  });

  if (isTauri) {
    try {
      console.log("📝 Initializing Tauri Kysely...");
      const kdb = new Kysely<Database>({
        dialect: new TauriSqliteDialect(),
      });

      dbInstance = kdb;
      console.log("✅ Database initialized (Tauri mode)");
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      errorManager.handleError(error, "DB_INIT_FAILURE");
    }
  } else {
    console.log("⚠️  Using mock database (Browser mode)");
  }
}

export const isRealDatabase = isTauri;
export const isMockDatabase = !isTauri;
