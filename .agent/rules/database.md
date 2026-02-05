# Database & Data Layer Rules

## Tech Stack
- **Engine:** SQLite (via Tauri architecture)
- **Access Library:** `@tauri-apps/plugin-sql` (Official Tauri Plugin)
- **Frontend-First:** All database operations are written in TypeScript in the React frontend.
- **No Node.js Modules:** Do NOT use `better-sqlite3` or non-browser compatible libraries.
- **No Custom Rust:** Do NOT implement custom Rust commands for standard database operations. Use the plugin's `db.execute()` and `db.select()`.

## Schema Definition
- Schema initialization happens in `src/services/database/client.ts`.
- Use raw SQL `CREATE TABLE` statements.
- Ensure `IF NOT EXISTS` is used.
- ALWAYS enable foreign keys: `PRAGMA foreign_keys = ON`.
- Use `snake_case` for database columns and tables.

## Data Access Rules
1. **Service Layer Only:**
   - NEVER call `db.execute()` or `db.select()` directly in UI components.
   - All DB logic resides in `src/services/*.service.ts`.
2. **DTO Mapping:**
   - Database returns `snake_case` objects.
   - Services MUST map these to `camelCase` domain objects before returning to UI.
3. **Type Safety:**
   - Use TypeScript interfaces for all query results.
   - Validate inputs with Zod schemas before INSERT/UPDATE.

## Example Pattern

```typescript
// src/services/ingredients.service.ts
import { getDatabase } from "./database/client";

export class IngredientService {
  async getAll(): Promise<Ingredient[]> {
    const db = await getDatabase();
    // Raw SQL with TypeScript generic for return type
    const result = await db.select<DatabaseRow[]>(
      "SELECT * FROM ingredients ORDER BY name"
    );
    // Map snake_case -> camelCase
    return result.map(this.mapRowToEntity);
  }

  async create(data: CreateInput): Promise<Ingredient> {
    const db = await getDatabase();
    // Use parameterized queries ($1, $2) to prevent injection
    const res = await db.execute(
      "INSERT INTO ingredients (name) VALUES ($1)",
      [data.name]
    );
    return this.getById(res.lastInsertId);
  }
}
```

## Migration & Changes
- Since we are not using an ORM migration tool, schema changes must be added to `initSchema()` in `client.ts` carefully.
- Check for column existence before adding columns in future updates.

---
**Last Updated:** 2026-02-04
