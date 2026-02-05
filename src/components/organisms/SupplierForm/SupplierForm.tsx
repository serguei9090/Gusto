import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupplierSchema } from "@/utils/validators";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import type { Supplier } from "@/types/ingredient.types";
import styles from "./SupplierForm.module.css";

interface SupplierFormProps {
    onSubmit: (data: any) => Promise<void>;
    initialData?: Supplier | null;
    onCancel: () => void;
    isLoading?: boolean;
}

export const SupplierForm = ({ onSubmit, initialData, onCancel, isLoading }: SupplierFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(createSupplierSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            contactPerson: initialData.contactPerson || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            address: initialData.address || "",
            paymentTerms: initialData.paymentTerms || "",
            notes: initialData.notes || ""
        } : {
            name: "",
            contactPerson: "",
            email: "",
            phone: "",
            address: "",
            paymentTerms: "",
            notes: ""
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.grid}>
                <FormField label="Supplier Name" required error={errors.name?.message}>
                    <Input {...register("name")} placeholder="e.g. Acme Food Supplies" />
                </FormField>

                <FormField label="Contact Person" error={errors.contactPerson?.message}>
                    <Input {...register("contactPerson")} placeholder="e.g. John Doe" />
                </FormField>

                <FormField label="Email Address" error={errors.email?.message}>
                    <Input type="email" {...register("email")} placeholder="e.g. sales@acme.com" />
                </FormField>

                <FormField label="Phone Number" error={errors.phone?.message}>
                    <Input {...register("phone")} placeholder="e.g. +1 234 567 890" />
                </FormField>
            </div>

            <FormField label="Address" error={errors.address?.message}>
                <Input {...register("address")} placeholder="Full business address" />
            </FormField>

            <FormField label="Payment Terms" error={errors.paymentTerms?.message}>
                <Input {...register("paymentTerms")} placeholder="e.g. Net 30, Cash on Delivery" />
            </FormField>

            <FormField label="Notes" error={errors.notes?.message}>
                <textarea
                    {...register("notes")}
                    className={styles.textarea}
                    placeholder="Any additional information..."
                />
            </FormField>

            <div className={styles.actions}>
                <Button variant="secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isLoading}>
                    {initialData ? "Update Supplier" : "Create Supplier"}
                </Button>
            </div>
        </form>
    );
};
