import type { Insertable, Selectable, Updateable } from "kysely";
import type { Supplier, SupplierFormData } from "@/features/suppliers/types";
import { db } from "@/lib/db";
import type { SuppliersTable } from "@/types/db.types";

export type SupplierRow = Selectable<SuppliersTable>;
export type CreateSupplierInput = Insertable<Omit<SuppliersTable, "id">>;
export type UpdateSupplierInput = Updateable<SuppliersTable>;

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

  async create(data: SupplierFormData): Promise<Supplier> {
    const dbData: CreateSupplierInput = {
      name: data.name,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      payment_terms: data.paymentTerms,
      account_number: data.accountNumber,
      notes: data.notes,
    };

    const result = await db
      .insertInto("suppliers")
      .values(dbData)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToDomain(result);
  }

  async update(id: number, data: Partial<SupplierFormData>): Promise<void> {
    const dbData: UpdateSupplierInput = {
      name: data.name,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      payment_terms: data.paymentTerms,
      account_number: data.accountNumber,
      notes: data.notes,
    };

    // Filter out undefined values to allow partial updates
    const cleanData = Object.fromEntries(
      Object.entries(dbData).filter(([_, v]) => v !== undefined),
    );

    await db
      .updateTable("suppliers")
      .set(cleanData)
      .where("id", "=", id)
      .execute();
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

  private mapToDomain(row: SupplierRow): Supplier {
    return {
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      paymentTerms: row.payment_terms,
      accountNumber: row.account_number,
      notes: row.notes,
      createdAt: row.created_at || "",
    };
  }
}

export const suppliersRepository = new SuppliersRepository();
