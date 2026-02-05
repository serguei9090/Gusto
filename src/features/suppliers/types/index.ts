export * from "@/types/ingredient.types";

export interface SupplierFormData {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
}
