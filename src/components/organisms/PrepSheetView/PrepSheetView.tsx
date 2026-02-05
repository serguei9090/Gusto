import { Printer, X, CheckSquare, ChefHat, Clock, Users } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { PrepSheet } from "@/types/prepSheet.types";
import styles from "./PrepSheetView.module.css";

interface PrepSheetViewProps {
    sheet: PrepSheet;
    onClose: () => void;
    onSave?: () => void;
    showSaveButton?: boolean;
}

export const PrepSheetView = ({ sheet, onClose, onSave, showSaveButton }: PrepSheetViewProps) => {
    const handlePrint = () => {
        globalThis.print();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{sheet.name}</h2>
                    <div className={styles.headerActions}>
                        {showSaveButton && onSave && (
                            <Button variant="secondary" onClick={onSave}>
                                Save for Later
                            </Button>
                        )}
                        <Button variant="primary" onClick={handlePrint}>
                            <Printer size={16} /> Print
                        </Button>
                        <button type="button" onClick={onClose} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.content} id="prep-sheet-print">
                    {/* Sheet Header */}
                    <div className={styles.sheetHeader}>
                        <div className={styles.sheetTitle}>
                            <ChefHat size={32} />
                            <div>
                                <h1>{sheet.name}</h1>
                                <p className={styles.subtitle}>{formatDate(sheet.date)}</p>
                            </div>
                        </div>
                        <div className={styles.sheetMeta}>
                            {sheet.shift && (
                                <div className={styles.metaItem}>
                                    <Clock size={16} />
                                    <span>{sheet.shift} Shift</span>
                                </div>
                            )}
                            {sheet.prepCookName && (
                                <div className={styles.metaItem}>
                                    <Users size={16} />
                                    <span>{sheet.prepCookName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recipe Summary */}
                    <div className={styles.section}>
                        <h3>Recipes to Prep</h3>
                        <div className={styles.recipeChips}>
                            {sheet.recipes.map(recipe => (
                                <div key={recipe.recipeId} className={styles.chip}>
                                    {recipe.recipeName}
                                    <span className={styles.chipBadge}>{recipe.requestedServings} srv</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ingredient Checklist */}
                    <div className={styles.section}>
                        <h3>Ingredient Checklist</h3>
                        <table className={styles.checklistTable}>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}><CheckSquare size={16} /></th>
                                    <th>Ingredient</th>
                                    <th style={{ textAlign: "right" }}>Quantity</th>
                                    <th>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sheet.items.map(item => (
                                    <tr key={item.ingredientId}>
                                        <td>
                                            <input type="checkbox" className={styles.checkbox} />
                                        </td>
                                        <td className={styles.ingredientName}>{item.ingredientName}</td>
                                        <td className={styles.quantity}>{item.totalQuantity.toFixed(2)}</td>
                                        <td className={styles.unit}>{item.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes */}
                    {sheet.notes && (
                        <div className={styles.section}>
                            <h3>Notes</h3>
                            <p className={styles.notes}>{sheet.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={styles.footer}>
                        <p>Generated: {new Date(sheet.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
