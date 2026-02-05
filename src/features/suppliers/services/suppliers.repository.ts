import type { Insertable, Updateable } from "kysely";
import type { Supplier } from "@/features/suppliers/types"; // Ensure this matches your type definition location
import { db } from "@/lib/db";

// Define the interface matching the database table
export interface SupplierTable {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  payment_terms: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export type CreateSupplierInput = Insertable<SupplierTable>;
export type UpdateSupplierInput = Updateable<SupplierTable>;

class SuppliersRepository {
  async getAll(): Promise<Supplier[]> {
    const result = await db
      .selectFrom("suppliers")
      .selectAll()
      .orderBy("name", "asc")
      .execute();

    // Map snake_case DB fields to camelCase domain objects if necessary
    // Kysely types are usually 1:1 with DB, but your app uses camelCase for domain objects
    return result.map(this.mapToDomain);
  }

  async getById(id: number): Promise<Supplier | null> {
    const result = await db
      .selectFrom("suppliers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return result ? this.mapToDomain(result) : null;
  }

  async create(data: Omit<CreateSupplierInput, "id">): Promise<Supplier> {
    // Note: Kysely returns InsertResult { insertId } on SQLite
    const result = await db
      .insertInto("suppliers")
      .values(data)
      .executeTakeFirstOrThrow();

    if (result.numInsertedOrUpdatedRows === BigInt(0)) {
      throw new Error("Failed to create supplier");
    }

    // SQLite doesn't return the inserted row by default in all drivers,
    // but Kysely's .returningAll() works if the dialect supports it (Postgres/SQLite usually)
    // For safer cross-driver support with Tauri SQL, fetch by ID
    const id = Number(result.insertId);
    const created = await this.getById(id);
    if (!created) throw new Error("Could not retrieve created supplier");

    return created;
  }

  async update(id: number, data: UpdateSupplierInput): Promise<void> {
    await db.updateTable("suppliers").set(data).where("id", "=", id).execute();
  }

  async delete(id: number): Promise<void> {
    // Check for linked ingredients first
    const linkedIngredients = await db
      .selectFrom("ingredients")
      .select("id")
      .where("supplier_id", "=", id)
      .limit(1)
      .execute();

    if (linkedIngredients.length > 0) {
      throw new Error(
        "Cannot delete supplier while it is linked to ingredients. Unlink them first.",
      );
    }

    await db.deleteFrom("suppliers").where("id", "=", id).execute();
  }

  private mapToDomain(row: SupplierTable): Supplier {
    return {
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      paymentTerms: row.payment_terms,
      notes: row.notes,
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined,
    };
  }
}

export const suppliersRepository = new SuppliersRepository();
