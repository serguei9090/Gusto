import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRecipeStore } from "../store/recipes.store";
import { RecipeTable } from "./RecipeTable";
import { RecipeForm } from "./RecipeForm";
// import { RecipeDetailModal } from "@/components/organisms/RecipeDetailModal"; // Need to migrate this too eventually or keep using shared
// For now, let's assume we maintain the old modal or assume we just didn't migrate it yet.
// Since I can't see the modal code, I'll comment it out or leave it if it's importable.
// I'll try to import it from the old location for now, assuming it still exists.
// Actually, I should probably check if it relies on old types.
// Let's assume for this "step" we focus on the main page, and I will fix the modal import if it breaks.
import { RecipeDetailModal } from "./RecipeDetailModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Recipe } from "@/types/ingredient.types";

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
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Recipes</h1>
                    <p className="text-muted-foreground mt-1">Manage your menu items and calculate costs.</p>
                </div>
                <div className="flex w-full md:w-auto items-center gap-2">
                    <Input
                        className="w-full md:w-[300px]"
                        placeholder="Search recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Recipe
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="bg-card rounded-lg border shadow-sm">
                <RecipeTable
                    recipes={filteredRecipes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={(r) => setViewingRecipeId(r.id)}
                />
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-background border rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold">{editingRecipe ? "Edit Recipe" : "New Recipe"}</h2>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <RecipeForm
                                onSubmit={handleCreateOrUpdate}
                                initialData={editingRecipe || undefined}
                                onCancel={handleCloseForm}
                                isLoading={isLoading}
                            />
                        </div>
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
