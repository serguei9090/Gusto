import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { useIngredientStore } from "@/store/ingredientStore";
import { recipeFormSchema, recipeCategorySchema, unitOfMeasureSchema } from "@/utils/validators";
import { calculateRecipeTotal, calculateProfitMargin, calculateSuggestedPrice, calculateIngredientCost } from "@/utils/costEngine";
import styles from "./RecipeForm.module.css";
import type { z } from "zod";

type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
    onSubmit: (data: RecipeFormData) => Promise<void>;
    initialData?: Partial<RecipeFormData>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const RecipeForm = ({ onSubmit, initialData, onCancel, isLoading }: RecipeFormProps) => {
    const { ingredients: allIngredients, fetchIngredients } = useIngredientStore();

    // Load ingredients if empty
    useEffect(() => {
        if (allIngredients.length === 0) fetchIngredients();
    }, [allIngredients.length, fetchIngredients]);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<RecipeFormData>({
        resolver: zodResolver(recipeFormSchema) as any,
        defaultValues: {
            name: "",
            servings: 1,
            ingredients: [],
            ...initialData
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients"
    });

    // Real-time calculations
    const watchedIngredients = watch("ingredients");
    const watchedSellingPrice = watch("sellingPrice") || 0;
    const watchedTargetMargin = watch("targetCostPercentage") || 30;

    // Calculate Total Cost
    const { totalCost } = calculateRecipeTotal(watchedIngredients.map(field => {
        // Find original ingredient to get current price if not stored
        const original = allIngredients.find(i => i.id === field.ingredientId);
        return {
            name: original?.name || "Unknown",
            quantity: field.quantity,
            unit: field.unit,
            currentPricePerUnit: field.price || original?.pricePerUnit || 0,
            ingredientUnit: field.ingredientUnit || original?.unitOfMeasure || "kg"
        };
    }));

    const currentMargin = calculateProfitMargin(totalCost, watchedSellingPrice);

    // Use utility
    const suggestedPrice = calculateSuggestedPrice(totalCost, watchedTargetMargin);

    const handleAddIngredient = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        if (!id) return;

        const original = allIngredients.find(i => i.id === id);
        if (original) {
            append({
                ingredientId: original.id,
                quantity: 1,
                unit: original.unitOfMeasure, // Default to base unit
                name: original.name, // Snapshot
                price: original.pricePerUnit, // Snapshot
                ingredientUnit: original.unitOfMeasure
            });
        }
        e.target.value = ""; // Reset Select
    };

    const submitHandler = handleSubmit((data) => {
        onSubmit(data);
    });

    const getMarginClass = (margin: number) => {
        if (margin < 20) return styles.marginLow;
        if (margin < 30) return styles.marginMed;
        return styles.marginHigh;
    };

    return (
        <form onSubmit={submitHandler} className={styles.container}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Recipe Details</h3>
                <div className={styles.grid}>
                    <FormField label="Recipe Name" error={errors.name?.message} required>
                        <Input {...register("name")} placeholder="e.g. Beef Burger" />
                    </FormField>

                    <FormField label="Category">
                        <select {...register("category")} className={styles.select}>
                            <option value="">Select Category</option>
                            {recipeCategorySchema.options.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Servings" error={errors.servings?.message} required>
                        <Input type="number" {...register("servings", { valueAsNumber: true })} min={1} />
                    </FormField>

                    <FormField label="Prep Time (mins)">
                        <Input type="number" {...register("prepTimeMinutes", { valueAsNumber: true })} />
                    </FormField>
                </div>

                <div className={styles.fullWidth}>
                    <FormField label="Description">
                        <textarea
                            {...register("description")}
                            className={styles.textarea}
                            placeholder="Brief overview of the dish..."
                        />
                    </FormField>
                </div>
            </div>

            <div className={styles.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 className={styles.sectionTitle}>Ingredients</h3>
                    <div>
                        <select onChange={handleAddIngredient} className={styles.ingSelect}>
                            <option value="">+ Add Ingredient...</option>
                            {allIngredients.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name} ({ing.unitOfMeasure})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.ingredientsTable}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Ingredient</th>
                                <th className={styles.th} style={{ width: 100 }}>Qty</th>
                                <th className={styles.th} style={{ width: 120 }}>Unit</th>
                                <th className={styles.th} style={{ textAlign: "right" }}>Cost</th>
                                <th className={styles.th} style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id}>
                                    <td className={styles.td}>{field.name || "Loading..."}</td>
                                    <td className={styles.td}>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                                        />
                                    </td>
                                    <td className={styles.td}>
                                        <select
                                            {...register(`ingredients.${index}.unit`)}
                                            className={styles.selectSmall}
                                        >
                                            {unitOfMeasureSchema.options.map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className={styles.td} style={{ textAlign: "right" }}>
                                        <CostDisplay
                                            quantity={watchedIngredients[index]?.quantity || 0}
                                            unit={watchedIngredients[index]?.unit || "kg"}
                                            basePrice={watchedIngredients[index]?.price || 0}
                                            baseUnit={watchedIngredients[index]?.ingredientUnit || "kg"}
                                        />
                                    </td>
                                    <td className={styles.td}>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className={styles.removeBtn}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fields.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.emptyTable}>
                                        No ingredients added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Cooking Instructions</h3>
                <textarea
                    {...register("cookingInstructions")}
                    className={styles.textareaLarge}
                    placeholder="Step by step preparation guide..."
                />
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Cost & Profit</h3>
                <div className={styles.grid}>
                    <FormField label="Selling Price" error={errors.sellingPrice?.message}>
                        <div className={styles.inputWithPrefix}>
                            <span className={styles.prefix}>$</span>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("sellingPrice", { valueAsNumber: true })}
                            />
                        </div>
                    </FormField>

                    <FormField label="Target Food Cost %">
                        <div className={styles.targetCostRow}>
                            <Input
                                type="number"
                                {...register("targetCostPercentage", { valueAsNumber: true })}
                                placeholder="30"
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => setValue("targetCostPercentage", 30)}>
                                30%
                            </Button>
                        </div>
                    </FormField>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Total Recipe Cost</span>
                        <div className={styles.summaryValue}>${totalCost.toFixed(2)}</div>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Actual Margin</span>
                        <div className={`${styles.summaryValue} ${getMarginClass(currentMargin)}`}>
                            {currentMargin.toFixed(1)}%
                        </div>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Suggested Price ({watchedTargetMargin}% Cost)</span>
                        <div className={`${styles.summaryValue} ${styles.suggested}`}>
                            ${Number.isFinite(suggestedPrice) ? suggestedPrice.toFixed(2) : "0.00"}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
                <Button variant="primary" type="submit" isLoading={isLoading}>
                    {initialData?.name ? "Update Recipe" : "Save Recipe"}
                </Button>
            </div>
        </form>
    );
};

// Sub-component for efficient row rendering
const CostDisplay = ({ quantity, unit, basePrice, baseUnit }: { quantity: number, unit: string, basePrice: number, baseUnit: string }) => {
    const { cost, error } = calculateIngredientCost(quantity, unit, basePrice, baseUnit);
    if (error) return <span style={{ color: "var(--color-error)", fontSize: "0.75rem" }} title={error}>!</span>;
    return <span>${cost.toFixed(2)}</span>;
};
