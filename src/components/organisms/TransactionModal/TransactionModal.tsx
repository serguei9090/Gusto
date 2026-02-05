import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema } from "@/utils/validators";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import type { Ingredient, TransactionType } from "@/types/ingredient.types";
import styles from "./TransactionModal.module.css";
import { X } from "lucide-react";

interface TransactionModalProps {
    ingredient: Ingredient;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export const TransactionModal = ({ ingredient, onClose, onSubmit, isLoading }: TransactionModalProps) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(createTransactionSchema),
        defaultValues: {
            ingredientId: ingredient.id,
            transactionType: "purchase" as TransactionType,
            quantity: 0,
            costPerUnit: ingredient.pricePerUnit || 0,
            totalCost: 0,
            reference: "",
            notes: ""
        }
    });

    const watchedQty = watch("quantity") || 0;
    const watchedPrice = watch("costPerUnit") || 0;
    const totalCost = watchedQty * watchedPrice;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Update Stock: {ingredient.name}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.grid}>
                        <FormField label="Transaction Type" required>
                            <select
                                {...register("transactionType")}
                                className={styles.select}
                            >
                                <option value="purchase">Purchase (Add Stock)</option>
                                <option value="usage">Usage (Subtract Stock)</option>
                                <option value="waste">Waste (Subtract Stock)</option>
                                <option value="adjustment">Adjustment (Stock Count)</option>
                            </select>
                        </FormField>

                        <FormField label={`Quantity (${ingredient.unitOfMeasure})`} required error={errors.quantity?.message}>
                            <Input
                                type="number"
                                step="any"
                                {...register("quantity", { valueAsNumber: true })}
                            />
                        </FormField>

                        <FormField label="Price per Unit">
                            <Input
                                type="number"
                                step="0.01"
                                {...register("costPerUnit", { valueAsNumber: true })}
                            />
                        </FormField>

                        <FormField label="Total Cost">
                            <div className={styles.totalDisplay}>
                                ${totalCost.toFixed(2)}
                            </div>
                        </FormField>
                    </div>

                    <FormField label="Reference / Invoice #">
                        <Input {...register("reference")} placeholder="e.g. INV-12345" />
                    </FormField>

                    <FormField label="Notes">
                        <textarea
                            {...register("notes")}
                            className={styles.textarea}
                            placeholder="Reason for adjustment, etc."
                        />
                    </FormField>

                    <div className={styles.actions}>
                        <Button variant="secondary" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" isLoading={isLoading}>
                            Save Transaction
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
