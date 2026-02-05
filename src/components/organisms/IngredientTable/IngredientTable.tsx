import type { Ingredient } from "@/types/ingredient.types";
import { Edit2, Trash2 } from "lucide-react";
import styles from "./IngredientTable.module.css";

export interface IngredientTableProps {
    ingredients: Ingredient[];
    onEdit: (ingredient: Ingredient) => void;
    onDelete: (id: number) => void;
}

export const IngredientTable = ({ ingredients, onEdit, onDelete }: IngredientTableProps) => {
    if (!ingredients || ingredients.length === 0) {
        return <div className={styles.empty}>No ingredients found. Add one to get started.</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.tr}>
                        <th className={styles.th}>Name</th>
                        <th className={styles.th}>Category</th>
                        <th className={styles.th}>Price / Batch</th>
                        <th className={styles.th}>Price / Unit</th>
                        <th className={styles.th}>Stock</th>
                        <th className={styles.th} style={{ width: '100px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map((ing) => (
                        <tr key={ing.id} className={styles.tr}>
                            <td className={styles.td}>
                                <div style={{ fontWeight: 500 }}>{ing.name}</div>
                            </td>
                            <td className={styles.td}>
                                <span style={{
                                    textTransform: 'capitalize',
                                    fontSize: '0.85rem',
                                    padding: '2px 8px',
                                    background: 'var(--color-neutral-100)',
                                    borderRadius: '12px'
                                }}>
                                    {ing.category}
                                </span>
                            </td>
                            <td className={styles.td}>${ing.currentPrice.toFixed(2)}</td>
                            <td className={styles.td}>${ing.pricePerUnit.toFixed(2)} / {ing.unitOfMeasure}</td>
                            <td className={styles.td}>
                                {ing.currentStock} {ing.unitOfMeasure}
                                {ing.minStockLevel && ing.currentStock <= ing.minStockLevel && (
                                    <span style={{ marginLeft: '8px', color: 'var(--color-warning)' }}>⚠️</span>
                                )}
                            </td>
                            <td className={styles.td}>
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => onEdit(ing)}
                                        className={styles.actionBtn}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(ing.id)}
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
