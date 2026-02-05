import type { Ingredient } from "@/types/ingredient.types";
import styles from "./InventoryTable.module.css";
import { AlertCircle, Edit3 } from "lucide-react";

interface InventoryTableProps {
    ingredients: Ingredient[];
    onRecordTransaction: (ingredient: Ingredient) => void;
}

export const InventoryTable = ({ ingredients, onRecordTransaction }: InventoryTableProps) => {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Ingredient</th>
                        <th className={styles.th}>Category</th>
                        <th className={styles.th}>Current Stock</th>
                        <th className={styles.th}>Min Level</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map((ingredient) => {
                        const isLow = ingredient.minStockLevel !== null && ingredient.currentStock <= ingredient.minStockLevel;

                        return (
                            <tr key={ingredient.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <div className={styles.name}>{ingredient.name}</div>
                                </td>
                                <td className={styles.td}>
                                    <span className={styles.category}>{ingredient.category}</span>
                                </td>
                                <td className={styles.td}>
                                    <span className={`${styles.stock} ${isLow ? styles.low : ""}`}>
                                        {ingredient.currentStock} {ingredient.unitOfMeasure}
                                    </span>
                                </td>
                                <td className={styles.td}>
                                    {ingredient.minStockLevel ? `${ingredient.minStockLevel} ${ingredient.unitOfMeasure}` : "-"}
                                </td>
                                <td className={styles.td}>
                                    {isLow ? (
                                        <div className={styles.statusBadgeLow}>
                                            <AlertCircle size={14} />
                                            <span>Low Stock</span>
                                        </div>
                                    ) : (
                                        <div className={styles.statusBadgeOk}>
                                            <span>In Stock</span>
                                        </div>
                                    )}
                                </td>
                                <td className={styles.td}>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => onRecordTransaction(ingredient)}
                                            title="Record Transaction"
                                        >
                                            <Edit3 size={16} />
                                            <span>Update</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
