import type { Kysely } from "kysely";
import { sql } from "kysely";

/**
 * Add recipe experiment/variant support
 */
export const migration = {
  async up(db: Kysely<unknown>): Promise<void> {
    // Add experiment columns to recipes table
    await db.schema
      .alterTable("recipes")
      .addColumn("is_experiment", "integer", (col) =>
        col.defaultTo(0).notNull(),
      )
      .execute();

    await db.schema
      .alterTable("recipes")
      .addColumn("parent_recipe_id", "integer")
      .execute();

    await db.schema
      .alterTable("recipes")
      .addColumn("experiment_name", "text")
      .execute();

    // Create indexes for efficient experiment queries
    await sql`CREATE INDEX idx_recipes_parent ON recipes(parent_recipe_id)`.execute(
      db,
    );
    await sql`CREATE INDEX idx_recipes_experiments ON recipes(is_experiment, parent_recipe_id)`.execute(
      db,
    );
  },

  async down(db: Kysely<unknown>): Promise<void> {
    // Drop indexes
    await sql`DROP INDEX IF EXISTS idx_recipes_experiments`.execute(db);
    await sql`DROP INDEX IF EXISTS idx_recipes_parent`.execute(db);

    // Remove columns
    await db.schema
      .alterTable("recipes")
      .dropColumn("experiment_name")
      .execute();

    await db.schema
      .alterTable("recipes")
      .dropColumn("parent_recipe_id")
      .execute();

    await db.schema.alterTable("recipes").dropColumn("is_experiment").execute();
  },
};
