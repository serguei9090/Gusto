import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRecipeStore } from "@/store/recipeStore";
import { RecipeTable } from "@/components/organisms/RecipeTable";
import { RecipeForm } from "@/components/organisms/RecipeForm";
import { RecipeDetailModal } from "@/components/organisms/RecipeDetailModal";
import { Button } from "@/components/atoms/Button";
import { SearchBar } from "@/components/molecules/SearchBar";
import type { Recipe } from "@/types/ingredient.types";
import styles from "./RecipesPage.module.css";

export const RecipesPage = () => {
    const {
        recipes,
        fetchRecipes,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        isLoading,
        error,
        searchQuery,
        setSearchQuery
    } = useRecipeStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingRecipeId, setViewingRecipeId] = useState<number | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateOrUpdate = async (data: any) => {
        try {
            if (editingRecipe) {
                await updateRecipe(editingRecipe.id, data);
            } else {
                await createRecipe(data);
            }
            handleCloseForm();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const handleEdit = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRecipe(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this recipe?")) {
            await deleteRecipe(id);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.searchArea}>
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search recipes..."
                    />
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus size={18} />
                    Add Recipe
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <RecipeTable
                recipes={filteredRecipes}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={(r) => setViewingRecipeId(r.id)}
            />

            {isFormOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{editingRecipe ? "Edit Recipe" : "New Recipe"}</h2>
                        </div>
                        <RecipeForm
                            onSubmit={handleCreateOrUpdate}
                            initialData={editingRecipe || undefined}
                            onCancel={handleCloseForm}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}

            {viewingRecipeId && (
                <RecipeDetailModal
                    recipeId={viewingRecipeId}
                    onClose={() => setViewingRecipeId(null)}
                />
            )}
        </div>
    );
};
