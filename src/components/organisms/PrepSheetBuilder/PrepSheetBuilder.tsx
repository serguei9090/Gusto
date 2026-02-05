import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, ChefHat } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { useRecipeStore } from "@/store/recipeStore";
import { usePrepSheetStore } from "@/store/prepSheetStore";
import type { PrepSheetFormData } from "@/types/prepSheet.types";
import styles from "./PrepSheetBuilder.module.css";

interface PrepSheetBuilderProps {
    onGenerate: (formData: PrepSheetFormData) => void;
    isLoading?: boolean;
}

export const PrepSheetBuilder = ({ onGenerate, isLoading }: PrepSheetBuilderProps) => {
    const { recipes, fetchRecipes } = useRecipeStore();
    const { builderSelections, addRecipeToBuilder, updateBuilderServings, removeRecipeFromBuilder, clearBuilder } = usePrepSheetStore();

    const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");

    const { register, handleSubmit, formState: { errors } } = useForm<Pick<PrepSheetFormData, "name" | "date" | "shift" | "prepCookName" | "notes">>({
        defaultValues: {
            name: `Prep Sheet - ${new Date().toLocaleDateString()}`,
            date: new Date().toISOString().split("T")[0],
            shift: "AM"
        }
    });

    useEffect(() => {
        if (recipes.length === 0) fetchRecipes();
    }, [recipes.length, fetchRecipes]);

    const handleAddRecipe = () => {
        if (!selectedRecipeId) return;
        const recipe = recipes.find(r => r.id === Number(selectedRecipeId));
        if (recipe) {
            addRecipeToBuilder(recipe.id, recipe.servings);
            setSelectedRecipeId("");
        }
    };

    const handleFormSubmit = handleSubmit((data) => {
        if (builderSelections.length === 0) return;
        onGenerate({
            ...data,
            recipeSelections: builderSelections
        });
    });

    const getRecipeName = (recipeId: number) => {
        return recipes.find(r => r.id === recipeId)?.name || "Unknown";
    };

    return (
        <form onSubmit={handleFormSubmit} className={styles.container}>
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Sheet Details</h3>
                <div className={styles.grid}>
                    <FormField label="Sheet Name" error={errors.name?.message} required>
                        <Input {...register("name", { required: true })} placeholder="e.g. Morning Prep" />
                    </FormField>

                    <FormField label="Date" required>
                        <Input type="date" {...register("date", { required: true })} />
                    </FormField>

                    <FormField label="Shift">
                        <select {...register("shift")} className={styles.select}>
                            <option value="AM">AM (Morning)</option>
                            <option value="PM">PM (Evening)</option>
                            <option value="Full Day">Full Day</option>
                        </select>
                    </FormField>

                    <FormField label="Prep Cook">
                        <Input {...register("prepCookName")} placeholder="Name (optional)" />
                    </FormField>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.headerRow}>
                    <h3 className={styles.sectionTitle}>Select Recipes</h3>
                    <div className={styles.addRow}>
                        <select
                            value={selectedRecipeId}
                            onChange={(e) => setSelectedRecipeId(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">Choose a recipe...</option>
                            {recipes
                                .filter(r => !builderSelections.some(s => s.recipeId === r.id))
                                .map(recipe => (
                                    <option key={recipe.id} value={recipe.id}>
                                        {recipe.name} ({recipe.servings} servings)
                                    </option>
                                ))}
                        </select>
                        <Button type="button" onClick={handleAddRecipe} disabled={!selectedRecipeId}>
                            <Plus size={16} /> Add
                        </Button>
                    </div>
                </div>

                {builderSelections.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ChefHat size={48} />
                        <p>No recipes selected yet.</p>
                        <p className={styles.hint}>Add recipes above to build your prep sheet.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Recipe</th>
                                <th style={{ width: 120 }}>Servings</th>
                                <th style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {builderSelections.map(selection => (
                                <tr key={selection.recipeId}>
                                    <td>{getRecipeName(selection.recipeId)}</td>
                                    <td>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={selection.servings}
                                            onChange={(e) => updateBuilderServings(selection.recipeId, Number(e.target.value))}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => removeRecipeFromBuilder(selection.recipeId)}
                                            className={styles.removeBtn}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className={styles.section}>
                <FormField label="Notes (Optional)">
                    <textarea
                        {...register("notes")}
                        className={styles.textarea}
                        placeholder="Special instructions, ingredient substitutions, etc."
                    />
                </FormField>
            </div>

            <div className={styles.actions}>
                <Button type="button" variant="ghost" onClick={clearBuilder}>
                    Clear All
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={builderSelections.length === 0}
                    isLoading={isLoading}
                >
                    Generate Prep Sheet
                </Button>
            </div>
        </form>
    );
};
