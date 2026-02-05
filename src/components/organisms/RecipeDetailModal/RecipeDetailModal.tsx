import { useEffect } from "react";
import { useRecipeStore } from "@/store/recipeStore";
import { Printer, X, ChefHat, Clock, Users } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import styles from "./RecipeDetailModal.module.css";

interface RecipeDetailModalProps {
    recipeId: number;
    onClose: () => void;
}

export const RecipeDetailModal = ({ recipeId, onClose }: RecipeDetailModalProps) => {
    const { selectedRecipe, fetchFullRecipe, isLoading, error } = useRecipeStore();

    useEffect(() => {
        fetchFullRecipe(recipeId);
    }, [recipeId, fetchFullRecipe]);

    const handlePrint = () => {
        globalThis.print();
    };

    if (isLoading) return <div className={styles.loading}>Loading Recipe Details...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!selectedRecipe) return null;

    const costPerServing = selectedRecipe.totalCost ? selectedRecipe.totalCost / selectedRecipe.servings : 0;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={`${styles.header} no-print`}>
                    <div className={styles.titleGroup}>
                        <ChefHat size={20} className={styles.icon} />
                        <h2>Recipe Detail</h2>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="secondary" onClick={handlePrint} className={styles.printBtn}>
                            <Printer size={18} />
                            Print Cost Sheet
                        </Button>
                        <button onClick={onClose} className={styles.closeBtn}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className={styles.content} id="printable-recipe">
                    {/* Header Info */}
                    <div className={styles.recipeHeader}>
                        <h1 className={styles.recipeName}>{selectedRecipe.name}</h1>
                        <p className={styles.category}>{selectedRecipe.category || "Uncategorized"}</p>

                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Users size={16} />
                                <span>Yield: {selectedRecipe.servings} servings</span>
                            </div>
                            {selectedRecipe.prepTimeMinutes && (
                                <div className={styles.metaItem}>
                                    <Clock size={16} />
                                    <span>Prep: {selectedRecipe.prepTimeMinutes} mins</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {selectedRecipe.description && (
                        <div className={styles.section}>
                            <h3>Description</h3>
                            <p className={styles.description}>{selectedRecipe.description}</p>
                        </div>
                    )}

                    {/* Ingredients Table */}
                    <div className={styles.section}>
                        <h3>Ingredients & Cost Breakdown</h3>
                        <table className={styles.ingTable}>
                            <thead>
                                <tr>
                                    <th>Ingredient</th>
                                    <th>Quantity</th>
                                    <th>Unit Cost</th>
                                    <th className={styles.textRight}>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRecipe.ingredients.map((ing) => (
                                    <tr key={ing.id}>
                                        <td>{ing.ingredientName}</td>
                                        <td>{ing.quantity} {ing.unit}</td>
                                        <td>${ing.currentPricePerUnit?.toFixed(2)} / {ing.ingredientUnit}</td>
                                        <td className={styles.textRight}>${ing.cost?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className={styles.totalRow}>
                                    <td colSpan={3}>Total Batch Cost</td>
                                    <td className={styles.textRight}>${selectedRecipe.totalCost?.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Cards */}
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Cost per Serving</span>
                            <span className={styles.summaryValue}>${costPerServing.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryCard}>
                            <span className={styles.summaryLabel}>Selling Price</span>
                            <span className={styles.summaryValue}>${selectedRecipe.sellingPrice?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className={`${styles.summaryCard} ${selectedRecipe.profitMargin && selectedRecipe.profitMargin >= 30 ? styles.marginGood : styles.marginCheck}`}>
                            <span className={styles.summaryLabel}>Profit Margin</span>
                            <span className={styles.summaryValue}>{selectedRecipe.profitMargin?.toFixed(1)}%</span>
                        </div>
                    </div>

                    {/* Instructions */}
                    {selectedRecipe.cookingInstructions && (
                        <div className={styles.section}>
                            <h3>Cooking Instructions</h3>
                            <div className={styles.instructions}>
                                {selectedRecipe.cookingInstructions}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
