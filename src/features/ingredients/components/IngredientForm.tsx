import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createIngredientSchema } from "@/utils/validators";
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CreateIngredientInput } from "../types";

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
    const { suppliers, fetchSuppliers } = useSupplierStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormSchema>({
        // @ts-ignore zodResolver typing works but can be tricky
        resolver: zodResolver(createIngredientSchema),
        defaultValues: {
            currentStock: 0,
            ...defaultValues,
        },
    });

    useEffect(() => {
        if (suppliers.length === 0) fetchSuppliers();
    }, [suppliers.length, fetchSuppliers]);

    const submitHandler = handleSubmit((data) => {
        onSubmit(data as unknown as CreateIngredientInput);
    });

    return (
        <form onSubmit={submitHandler} className="space-y-6 max-w-2xl mx-auto p-1">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Tomato Sauce"
                    {...register("name")}
                    className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                        id="category"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        {...register("category")}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                        id="unit"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        {...register("unitOfMeasure")}
                    >
                        {UNITS.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                    {errors.unitOfMeasure && <p className="text-xs text-destructive">{errors.unitOfMeasure.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPrice">Price (Total)</Label>
                    <Input
                        id="currentPrice"
                        type="number"
                        step="0.01"
                        {...register("currentPrice", { valueAsNumber: true })}
                        className={cn(errors.currentPrice && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.currentPrice && <p className="text-xs text-destructive">{errors.currentPrice.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">Price per Unit</Label>
                    <Input
                        id="pricePerUnit"
                        type="number"
                        step="0.01"
                        {...register("pricePerUnit", { valueAsNumber: true })}
                        className={cn(errors.pricePerUnit && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.pricePerUnit && <p className="text-xs text-destructive">{errors.pricePerUnit.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                        id="currentStock"
                        type="number"
                        step="0.01"
                        {...register("currentStock", { valueAsNumber: true })}
                    />
                    {errors.currentStock && <p className="text-xs text-destructive">{errors.currentStock.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock (Alert Level)</Label>
                    <Input
                        id="minStock"
                        type="number"
                        step="0.01"
                        {...register("minStockLevel", { valueAsNumber: true })}
                    />
                    {errors.minStockLevel && <p className="text-xs text-destructive">{errors.minStockLevel.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="supplierId">Preferred Supplier</Label>
                <select
                    id="supplierId"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("supplierId", { valueAsNumber: true })}
                >
                    <option value="">None</option>
                    {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Ingredient"}
                </Button>
            </div>
        </form>
    );
};
