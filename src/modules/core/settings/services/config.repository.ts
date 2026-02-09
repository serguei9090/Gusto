import type { Selectable } from "kysely";
import { db } from "@/lib/db";
import type { ConfigurationItemsTable } from "@/types/db.types";

export type ConfigItem = Selectable<ConfigurationItemsTable>;

export class ConfigRepository {
  async getAll(): Promise<ConfigItem[]> {
    return await db
      .selectFrom("configuration_items")
      .selectAll()
      .orderBy("order_index", "asc")
      .orderBy("name", "asc")
      .execute();
  }

  async getByType(type: ConfigItem["type"]): Promise<ConfigItem[]> {
    return await db
      .selectFrom("configuration_items")
      .selectAll()
      .where("type", "=", type)
      .orderBy("order_index", "asc")
      .orderBy("name", "asc")
      .execute();
  }

  async add(type: ConfigItem["type"], name: string): Promise<ConfigItem> {
    // Check for duplicates
    const existing = await db
      .selectFrom("configuration_items")
      .selectAll()
      .where("type", "=", type)
      .where("name", "=", name)
      .executeTakeFirst();

    if (existing) return existing;

    const [result] = await db
      .insertInto("configuration_items")
      .values({
        type,
        name,
        is_default: 0,
      })
      .returningAll()
      .execute();
    return result;
  }

  async delete(id: number): Promise<void> {
    const item = await db
      .selectFrom("configuration_items")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!item) throw new Error("Item not found");

    await db.deleteFrom("configuration_items").where("id", "=", id).execute();
  }

  async restoreDefaults(type: ConfigItem["type"]): Promise<void> {
    // This is a bit tricky since "defaults" are hardcoded in migration.
    // We could either re-run migration logic or have a static list.
    // For simplicity and to follow the user request, I'll just use a static list here
    // that matches the migration seed.

    const defaults: Record<string, string[]> = {
      ingredient_category: [
        "Protein",
        "Vegetable",
        "Dairy",
        "Spice",
        "Grain",
        "Fruit",
        "Condiment",
        "Other",
      ],
      recipe_category: [
        "Appetizer",
        "Main",
        "Dessert",
        "Beverage",
        "Side",
        "Other",
      ],
    };

    if (type.startsWith("unit")) {
      // Handle standard units with categories
      const { STANDARD_UNITS } = await import("@/lib/constants/units");
      for (const [category, units] of Object.entries(STANDARD_UNITS)) {
        for (const unitName of units) {
          await db
            .insertInto("configuration_items")
            .values({
              type: `unit:${category}`,
              name: unitName,
              is_default: 1,
            })
            .onConflict((oc) => oc.columns(["type", "name"]).doNothing())
            .execute();
        }
      }
      return;
    }

    const itemsToRestore = defaults[type] || [];
    for (const name of itemsToRestore) {
      await db
        .insertInto("configuration_items")
        .values({
          type,
          name,
          is_default: 1,
        })
        .onConflict((oc) => oc.columns(["type", "name"]).doNothing())
        .execute();
    }
  }

  async reorder(ids: number[]): Promise<void> {
    await db.transaction().execute(async (trx) => {
      for (let i = 0; i < ids.length; i++) {
        await trx
          .updateTable("configuration_items")
          .set({ order_index: i })
          .where("id", "=", ids[i])
          .execute();
      }
    });
  }
}

export const configRepository = new ConfigRepository();
