import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getDb } from "@/lib/db";
import type { Database } from "@/types/db.types";

interface BackupData {
  version: number;
  timestamp: string;
  data: Partial<Record<keyof Database, unknown[]>>;
}

const BACKUP_VERSION = 1;

// List of tables to backup/restore in order
// Order matters for restoration (foreign keys), though we might disable FKs during restore
const TABLES: (keyof Database)[] = [
  "currencies",
  "exchange_rates",
  "configuration_items",
  "app_settings",
  "suppliers",
  "ingredients",
  "recipes",
  "recipe_ingredients",
  "recipe_versions",
  "inventory_transactions",
  "prep_sheets",
];

export const backupService = {
  async exportDatabase(): Promise<string> {
    const db = getDb();
    const backup: BackupData = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      data: {},
    };

    // Fetch data from all tables
    for (const table of TABLES) {
      const rows = await db.selectFrom(table).selectAll().execute();
      backup.data[table] = rows;
    }

    // Prompt user to save file
    const filePath = await save({
      filters: [
        {
          name: "Gusto Backup",
          extensions: ["json"],
        },
      ],
      defaultPath: `gusto-backup-${new Date().toISOString().split("T")[0]}.json`,
    });

    if (!filePath) {
      return "cancelled";
    }

    await writeTextFile(filePath, JSON.stringify(backup, null, 2));
    return "success";
  },

  async importDatabase(): Promise<{ success: boolean; message: string }> {
    const filePath = await open({
      filters: [
        {
          name: "Gusto Backup",
          extensions: ["json"],
        },
      ],
      multiple: false,
    });

    if (!filePath) {
      return { success: false, message: "cancelled" };
    }

    try {
      const content = await readTextFile(filePath as string);
      const backup: BackupData = JSON.parse(content);

      if (backup.version !== BACKUP_VERSION) {
        return {
          success: false,
          message: "Incompatible backup version.",
        };
      }

      const db = getDb();

      // Transactional restore
      await db.transaction().execute(async (trx) => {
        // Disable Foreign Keys if possible, or just delete in reverse order
        // Kysely/SQLite usually enforces FKs.
        // We delete in reverse order of dependencies.
        const reverseTables = [...TABLES].reverse();

        for (const table of reverseTables) {
          await trx.deleteFrom(table).execute();
        }

        // Insert new data in dependency order
        for (const table of TABLES) {
          const rows = backup.data[table];
          if (rows && Array.isArray(rows) && rows.length > 0) {
            // Batch insert
            // SQLite has limits on variables, so we might need to chunk if rows are huge.
            // For now, assuming reasonable size or Kysely handles it?
            // Safer to chunk.
            const chunkSize = 50;
            for (let i = 0; i < rows.length; i += chunkSize) {
              const chunk = rows.slice(i, i + chunkSize);
              await trx
                .insertInto(table)
                // biome-ignore lint/suspicious/noExplicitAny: Generic insert
                .values(chunk as any)
                .execute();
            }
          }
        }
      });

      return { success: true, message: "Import successful" };
    } catch (error) {
      console.error("Import failed:", error);
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
};
