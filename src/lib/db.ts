/**
 * Database Factory
 * 
 * Provides database access with automatic environment detection:
 * - Tauri: Real database via @/services/database/client  
 * - Browser/Dev: Mock database for testing
 */

import { mockDb } from "./db.browser";

// Environment detection
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * Get database instance
 * Call this function to get the appropriate database for the current environment
 */
export async function getDb(): Promise<any> {
    if (isTauri) {
        const { getDatabase } = await import("@/services/database/client");
        return await getDatabase();
    }
    return mockDb;
}

/**
 * Synchronous database access for immediate use
 * In Tauri mode, this will initially return mock until initialized
 * Use getDb() for guaranteed real database access
 */
export const db = mockDb;

/**
 * Initialize database at app startup
 * Call this in your app's main entry point
 */
export async function initDb(): Promise<void> {
    if (isTauri) {
        try {
            const { getDatabase } = await import("@/services/database/client");
            const realDb = await getDatabase();
            // Replace mockDb methods with real DB methods
            Object.assign(db, realDb);
            console.log("✅  Database initialized (Tauri mode)");
        } catch (error) {
            console.error("❌ Database initialization failed:", error);
        }
    } else {
        console.log("⚠️  Using mock database (Browser mode)");
    }
}

export const isRealDatabase = isTauri;
export const isMockDatabase = !isTauri;
