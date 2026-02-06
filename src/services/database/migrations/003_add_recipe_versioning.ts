import { type Kysely, sql } from "kysely";
import type { Database } from "@/types/db.types";

/**
 * Migration 003: Add Recipe Versioning
 *
 * This migration adds support for tracking recipe versions over time,
 * enabling historical analysis, cost trend tracking, and rollback capability.
 *
 * Features:
 * - Automatic version creation on recipe updates
 * - Complete snapshot of recipe state (including ingredients)
 * - Change tracking with reason/notes
 * - Rollback capability
 * - Cost trend analysis
 */

export const migration = {
  async up(db: Kysely<Database>): Promise<void> {
    // Create recipe_versions table
    await db.schema
      .createTable("recipe_versions")
      .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
      .addColumn("recipe_id", "integer", (col) => col.notNull())
      .addColumn("version_number", "integer", (col) => col.notNull())
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("description", "text")
      .addColumn("category", "text")
      .addColumn("servings", "integer", (col) => col.notNull())
      .addColumn("prep_time_minutes", "integer")
      .addColumn("cooking_instructions", "text")
      .addColumn("selling_price", "real")
      .addColumn("currency", "text", (col) => col.notNull().defaultTo("USD"))
      .addColumn("target_cost_percentage", "real")
      .addColumn("waste_buffer_percentage", "real")
      .addColumn("total_cost", "real")
      .addColumn("profit_margin", "real")
      .addColumn("ingredients_snapshot", "text", (col) => col.notNull()) // JSON snapshot
      .addColumn("change_reason", "text") // Why this version was created
      .addColumn("change_notes", "text") // Additional notes
      .addColumn("created_by", "text") // User who created this version
      .addColumn("created_at", "text", (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("is_current", "integer", (col) => col.notNull().defaultTo(0)) // 1 if current version
      .execute();

    // Create indexes for efficient querying
    await db.schema
      .createIndex("idx_recipe_versions_recipe_id")
      .on("recipe_versions")
      .column("recipe_id")
      .execute();

    await db.schema
      .createIndex("idx_recipe_versions_current")
      .on("recipe_versions")
      .columns(["recipe_id", "is_current"])
      .execute();

    // Create unique constraint for recipe_id + version_number
    await db.schema
      .createIndex("idx_recipe_versions_unique")
      .on("recipe_versions")
      .columns(["recipe_id", "version_number"])
      .unique()
      .execute();

    // Add version tracking columns to recipes table
    await sql`
      ALTER TABLE recipes 
      ADD COLUMN current_version INTEGER DEFAULT 1
    `.execute(db);

    await sql`
      ALTER TABLE recipes 
      ADD COLUMN last_version_date TEXT
    `.execute(db);

    console.log("✅ Migration 003: Recipe versioning tables created");

    // Create initial versions for existing recipes using raw SQL
    await sql`
      INSERT INTO recipe_versions (
        recipe_id, version_number, name, description, category, servings,
        prep_time_minutes, cooking_instructions, selling_price, currency,
        target_cost_percentage, waste_buffer_percentage, total_cost, profit_margin,
        ingredients_snapshot, change_reason, created_by, is_current
      )
      SELECT 
        r.id,
        1,
        r.name,
        r.description,
        r.category,
        r.servings,
        r.prep_time_minutes,
        r.cooking_instructions,
        r.selling_price,
        r.currency,
        r.target_cost_percentage,
        r.waste_buffer_percentage,
        r.total_cost,
        r.profit_margin,
        COALESCE(
          (
            SELECT json_group_array(
              json_object(
                'id', ri.id,
                'ingredient_id', ri.ingredient_id,
                'quantity', ri.quantity,
                'unit', ri.unit,
                'cost', ri.cost,
                'notes', ri.notes
              )
            )
            FROM recipe_ingredients ri
            WHERE ri.recipe_id = r.id
          ),
          '[]'
        ),
        'Initial version',
        'system',
        1
      FROM recipes r
    `.execute(db);

    // Update recipes with version info
    await sql`
      UPDATE recipes 
      SET current_version = 1,
          last_version_date = CURRENT_TIMESTAMP
    `.execute(db);

    console.log("✅ Created initial versions for existing recipes");
  },

  async down(db: Kysely<Database>): Promise<void> {
    // Remove version tracking columns from recipes table
    await sql`ALTER TABLE recipes DROP COLUMN current_version`.execute(db);
    await sql`ALTER TABLE recipes DROP COLUMN last_version_date`.execute(db);

    // Drop indexes
    await db.schema.dropIndex("idx_recipe_versions_recipe_id").execute();
    await db.schema.dropIndex("idx_recipe_versions_current").execute();
    await db.schema.dropIndex("idx_recipe_versions_unique").execute();

    // Drop recipe_versions table
    await db.schema.dropTable("recipe_versions").execute();

    console.log("✅ Migration 003: Recipe versioning rolled back");
  },
};
