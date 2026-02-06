import { Plus, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Recipe } from "@/types/ingredient.types";
import { useRecipeStore } from "../store/recipes.store";
import { RecipeDetailModal } from "./RecipeDetailModal";
import { RecipeForm } from "./RecipeForm";
import { RecipeTable } from "./RecipeTable";
import { useTranslation } from "@/hooks/useTranslation";

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
    setSearchQuery,
  } = useRecipeStore();
  const { t } = useTranslation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingRecipeId, setViewingRecipeId] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseForm();
        setViewingRecipeId(null);
      }
    };
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, [handleCloseForm]);

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // biome-ignore lint/suspicious/noExplicitAny: Form data type
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

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      await deleteRecipe(id);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("recipes.title")}</h2>
          <p className="text-muted-foreground">
            {t("recipes.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("recipes.addRecipe")}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          className="w-full max-w-sm"
          placeholder={t("recipes.placeholders.searchRecipes")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto bg-card rounded-md border shadow-sm">
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
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingRecipe ? t("recipes.editRecipe") : t("recipes.addRecipe")}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleCloseForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <RecipeForm
                onSubmit={handleCreateOrUpdate}
                // biome-ignore lint/suspicious/noExplicitAny: Currency enum mismatch
                initialData={editingRecipe as any || undefined}
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

