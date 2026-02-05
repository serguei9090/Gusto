import { getDatabase } from "./database/client";
import type { Supplier } from "@/types/ingredient.types";

export interface CreateSupplierInput {
    name: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    paymentTerms?: string | null;
    notes?: string | null;
}

export interface UpdateSupplierInput {
    name?: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    paymentTerms?: string | null;
    notes?: string | null;
}

class SupplierService {
    async getAll(): Promise<Supplier[]> {
        const db = await getDatabase();
        return db.select<Supplier[]>("SELECT * FROM suppliers ORDER BY name");
    }

    async getById(id: number): Promise<Supplier | null> {
        const db = await getDatabase();
        const suppliers = await db.select<Supplier[]>("SELECT * FROM suppliers WHERE id = $1", [id]);
        return suppliers.length > 0 ? suppliers[0] : null;
    }

    async create(data: CreateSupplierInput): Promise<Supplier> {
        const db = await getDatabase();
        const result = await db.execute(
            `INSERT INTO suppliers (name, contact_person, email, phone, address, payment_terms, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                data.name,
                data.contactPerson || null,
                data.email || null,
                data.phone || null,
                data.address || null,
                data.paymentTerms || null,
                data.notes || null,
            ]
        );

        const created = await db.select<Supplier[]>(
            "SELECT * FROM suppliers WHERE id = $1",
            [result.lastInsertId]
        );
        return created[0];
    }

    async update(id: number, data: UpdateSupplierInput): Promise<void> {
        const db = await getDatabase();

        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                // Convert camelCase to snake_case for DB
                const dbKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
                updates.push(`${dbKey} = $${i}`);
                params.push(value);
                i++;
            }
        });

        if (updates.length > 0) {
            params.push(id);
            await db.execute(
                `UPDATE suppliers SET ${updates.join(", ")} WHERE id = $${i}`,
                params
            );
        }
    }

    async delete(id: number): Promise<void> {
        const db = await getDatabase();
        // Check if supplier is linked to any ingredients
        const ingredients = await db.select<any[]>(
            "SELECT id FROM ingredients WHERE supplier_id = $1 LIMIT 1",
            [id]
        );

        if (ingredients.length > 0) {
            throw new Error("Cannot delete supplier while it is linked to ingredients. Unlink them first.");
        }

        await db.execute("DELETE FROM suppliers WHERE id = $1", [id]);
    }
}

export const supplierService = new SupplierService();
