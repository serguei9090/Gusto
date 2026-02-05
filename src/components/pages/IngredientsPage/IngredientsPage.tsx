import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useIngredientStore } from "@/store/ingredientStore";
import { IngredientTable } from "@/components/organisms/IngredientTable";
import { IngredientForm } from "@/components/organisms/IngredientForm";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Button } from "@/components/atoms/Button";
import { StatCard } from "@/components/molecules/StatCard";
import type { Ingredient, CreateIngredientInput } from "@/types/ingredient.types";
import styles from "./IngredientsPage.module.css";

export const IngredientsPage = () => {
    const { ingredients, fetchIngredients, createIngredient, updateIngredient, deleteIngredient, isLoading, error } = useIngredientStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    const filteredIngredients = useMemo(() => {
        return ingredients.filter(i =>
            i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [ingredients, searchTerm]);

    const handleCreate = async (data: CreateIngredientInput) => {
        await createIngredient(data);
        setIsFormOpen(false);
    };

    const handleUpdate = async (data: CreateIngredientInput) => {
        if (editingIngredient) {
            await updateIngredient(editingIngredient.id, data);
            setEditingIngredient(null);
            setIsFormOpen(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteIngredient(deleteId);
            setDeleteId(null);
        }
    };

    const openCreate = () => {
        setEditingIngredient(null);
        setIsFormOpen(true);
    };

    const openEdit = (ing: Ingredient) => {
        // We pass the full ingredient to the form. Form should use defaultValues.
        // Ensure types match or use casting.
        setEditingIngredient(ing);
        setIsFormOpen(true);
    };

    return (
        <div>
            <div className={styles.stats}>
                <StatCard label="Total Ingredients" value={ingredients.length} />
                {/* Simple count of low stock */}
                <StatCard label="Low Stock Alert" value={ingredients.filter(i => (i.minStockLevel !== null && i.minStockLevel !== undefined && i.currentStock <= i.minStockLevel)).length} />
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchArea}>
                    <SearchBar
                        placeholder="Search ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={openCreate}>
                    <Plus size={20} style={{ marginRight: 8 }} />
                    Add Ingredient
                </Button>
            </div>

            <IngredientTable
                ingredients={filteredIngredients}
                onEdit={openEdit}
                onDelete={setDeleteId}
            />

            {/* Error Toast Placeholder */}
            {error && (
                <div style={{ color: 'red', marginTop: 10 }}>Error: {error}</div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {editingIngredient ? "Edit Ingredient" : "New Ingredient"}
                        </h2>
                        <IngredientForm
                            onSubmit={editingIngredient ? handleUpdate : handleCreate}
                            onCancel={() => setIsFormOpen(false)}
                            defaultValues={editingIngredient || undefined}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={!!deleteId}
                onCancel={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={isLoading}
                title="Delete Ingredient"
                message="Are you sure you want to delete this ingredient? This action cannot be undone."
            />
        </div>
    );
};
