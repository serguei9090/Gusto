import { Edit2, Trash2, Eye } from "lucide-react";
import type { Recipe } from "@/types/ingredient.types";
import styles from "./RecipeTable.module.css";

interface RecipeTableProps {
    recipes: Recipe[];
    onEdit: (recipe: Recipe) => void;
    onDelete: (id: number) => void;
    onView: (recipe: Recipe) => void;
}

export const RecipeTable = ({ recipes, onEdit, onDelete, onView }: RecipeTableProps) => {
    const formatCurrency = (val: number | null) => {
        if (val === null || val === undefined) return "-";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const formatPercent = (val: number | null) => {
        if (val === null || val === undefined) return "-";
        return `${val.toFixed(1)}%`;
    };

    const getMarginClass = (val: number | null) => {
        if (val === null || val === undefined) return "";
        if (val < 20) return styles.marginLow;
        if (val < 30) return styles.marginMed;
        return styles.marginHigh;
    };

    if (recipes.length === 0) {
        return <div className={styles.empty}>No recipes found. Create one to get started.</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Name</th>
                        <th className={styles.th}>Category</th>
                        <th className={styles.th}>Servings</th>
                        <th className={styles.th}>Total Cost</th>
                        <th className={styles.th}>Selling Price</th>
                        <th className={styles.th}>Margin</th>
                        <th className={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {recipes.map((recipe) => (
                        <tr key={recipe.id} className={styles.tr}>
                            <td className={styles.td} style={{ fontWeight: 500 }}>{recipe.name}</td>
                            <td className={styles.td} style={{ textTransform: "capitalize" }}>{recipe.category || "-"}</td>
                            <td className={styles.td}>{recipe.servings}</td>
                            <td className={styles.td}>{formatCurrency(recipe.totalCost)}</td>
                            <td className={styles.td}>{formatCurrency(recipe.sellingPrice)}</td>
                            <td className={`${styles.td} ${getMarginClass(recipe.profitMargin)}`}>
                                {formatPercent(recipe.profitMargin)}
                            </td>
                            <td className={styles.td}>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => onView(recipe)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => onEdit(recipe)}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={() => onDelete(recipe.id)}
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
