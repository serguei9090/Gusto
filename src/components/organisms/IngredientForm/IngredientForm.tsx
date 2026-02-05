import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createIngredientSchema } from "@/utils/validators";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import styles from "./IngredientForm.module.css";
import type { CreateIngredientInput } from "@/types/ingredient.types";

// Infer directly from schema to ensure match
type FormSchema = z.infer<typeof createIngredientSchema>;

interface IngredientFormProps {
    defaultValues?: Partial<CreateIngredientInput>;
    onSubmit: (data: CreateIngredientInput) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

const CATEGORIES = [
    "protein", "vegetable", "dairy", "spice", "grain", "fruit", "condiment", "other"
];
const UNITS = ["kg", "g", "l", "ml", "piece", "cup", "tbsp", "tsp"];

export const IngredientForm = ({ defaultValues, onSubmit, onCancel, isLoading }: IngredientFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormSchema>({
        // @ts-ignore zodResolver typing is sometimes tricky with strict mode
        resolver: zodResolver(createIngredientSchema),
        defaultValues: {
            currentStock: 0,
            ...defaultValues,
        },
    });

    const submitHandler = handleSubmit((data) => {
        onSubmit(data as unknown as CreateIngredientInput);
    });

    return (
        <form onSubmit={submitHandler} className={styles.form}>
            <FormField
                label="Name"
                id="name"
                error={errors.name?.message}
                {...register("name")}
            />

            <div className={styles.row}>
                <div style={{ width: '100%' }}>
                    <Label htmlFor="category" required>
                        Category
                    </Label>
                    <select
                        id="category"
                        className={styles.select}
                        {...register("category")}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{errors.category.message}</span>}
                </div>

                <div style={{ width: '100%' }}>
                    <Label htmlFor="unit" required>
                        Unit
                    </Label>
                    <select
                        id="unit"
                        className={styles.select}
                        {...register("unitOfMeasure")}
                    >
                        {UNITS.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                    {errors.unitOfMeasure && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{errors.unitOfMeasure.message}</span>}
                </div>
            </div>

            <div className={styles.row}>
                <FormField
                    label="Price (Total)"
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    error={errors.currentPrice?.message}
                    {...register("currentPrice", { valueAsNumber: true })}
                />
                <FormField
                    label="Price per Unit"
                    id="pricePerUnit"
                    type="number"
                    step="0.01"
                    error={errors.pricePerUnit?.message}
                    {...register("pricePerUnit", { valueAsNumber: true })}
                />
            </div>

            <div className={styles.row}>
                <FormField
                    label="Current Stock"
                    id="currentStock"
                    type="number"
                    step="0.01"
                    error={errors.currentStock?.message}
                    {...register("currentStock", { valueAsNumber: true })}
                />
                <FormField
                    label="Min Stock"
                    id="minStock"
                    type="number"
                    step="0.01"
                    error={errors.minStockLevel?.message}
                    {...register("minStockLevel", { valueAsNumber: true })}
                />
            </div>

            <div className={styles.actions}>
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" isLoading={isLoading}>
                    Save Ingredient
                </Button>
            </div>
        </form>
    );
};
