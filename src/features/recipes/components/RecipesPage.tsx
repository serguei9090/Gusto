import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import type { Recipe } from "@/types/ingredient.types";
import { useRecipeStore } from "../store/recipes.store";
import { BulkRollbackDialog } from "./BulkRollbackDialog";
import { RecipeDetailModal } from "./RecipeDetailModal";
import { RecipeForm, type RecipeFormData } from "./RecipeForm";
import { RecipeTable } from "./RecipeTable";

export const RecipesPage = () => {
  const {
    recipes,
    fetchRecipes,
    fetchFullRecipe,
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
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
  const selectedRecipe = useRecipeStore((state) => state.selectedRecipe);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRecipeId(null);
    useRecipeStore.getState().selectRecipe(null);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Handle ESC key to close detail modal (Dialog handles its own ESC)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewingRecipeId(null);
      }
    };
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, []);

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateOrUpdate = async (data: RecipeFormData) => {
    try {
      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, data);
      } else {
        await createRecipe(data);
      }
      handleCloseForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleEdit = async (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setIsFormOpen(true);
    // Fetch full recipe details for the form
    await fetchFullRecipe(recipe.id);
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
          <h2 className="text-3xl font-bold tracking-tight">
            {t("recipes.title")}
          </h2>
          <p className="text-muted-foreground">{t("recipes.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkRollbackDialog />
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipeId
                ? t("recipes.editRecipe")
                : t("recipes.addRecipe")}
            </DialogTitle>
            <DialogDescription>
              {editingRecipeId
                ? "Update the recipe details below."
                : "Fill out the form below to create a new recipe."}
            </DialogDescription>
          </DialogHeader>
          {editingRecipeId && isLoading && !selectedRecipe ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground italic">
                Loading recipe details...
              </p>
            </div>
          ) : (
            <RecipeForm
              onSubmit={handleCreateOrUpdate}
              initialData={
                editingRecipeId && selectedRecipe
                  ? ({
                      name: selectedRecipe.name,
                      servings: selectedRecipe.servings,
                      currency: selectedRecipe.currency,
                      category: selectedRecipe.category || undefined,
                      description: selectedRecipe.description || undefined,
                      prepTimeMinutes:
                        selectedRecipe.prepTimeMinutes || undefined,
                      cookingInstructions:
                        selectedRecipe.cookingInstructions || undefined,
                      sellingPrice: selectedRecipe.sellingPrice || undefined,
                      targetCostPercentage:
                        selectedRecipe.targetCostPercentage || undefined,
                      wasteBufferPercentage:
                        selectedRecipe.wasteBufferPercentage || undefined,
                      ingredients: selectedRecipe.ingredients.map((ing) => ({
                        ingredientId: ing.ingredientId,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        name: ing.ingredientName,
                        price: ing.currentPricePerUnit,
                        ingredientUnit: ing.ingredientUnit,
                      })),
                    } as Partial<RecipeFormData>)
                  : undefined
              }
              onCancel={handleCloseForm}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {viewingRecipeId && (
        <RecipeDetailModal
          recipeId={viewingRecipeId}
          onClose={() => setViewingRecipeId(null)}
        />
      )}
    </div>
  );
};
