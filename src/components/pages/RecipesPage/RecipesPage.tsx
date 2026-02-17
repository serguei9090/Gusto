import {
  ChefHat,
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BulkRollbackDialog } from "@/components/organisms/BulkRollbackDialog";
import { Button } from "@/components/ui/button";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { RecipeDeleteDialog } from "@/modules/core/recipes/components/molecules/RecipeDeleteDialog";
import { RecipeDetailModal } from "@/modules/core/recipes/components/organisms/RecipeDetailModal";
import {
  RecipeForm,
  type RecipeFormData,
} from "@/modules/core/recipes/components/organisms/RecipeForm";
import { RecipeTable } from "@/modules/core/recipes/components/organisms/RecipeTable";
import { useRecipeStore } from "@/modules/core/recipes/store/recipes.store";
import type { Recipe, UpdateRecipeInput } from "@/types/ingredient.types";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeletingUsageWarning, setIsDeletingUsageWarning] = useState(false);
  const selectedRecipe = useRecipeStore((state) => state.selectedRecipe);
  const isRecipeUsedAsSubRecipe = useRecipeStore(
    (state) => state.isRecipeUsedAsSubRecipe,
  );

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
      // Clean data to match store expectations (remove UI-only fields from ingredients)
      const cleanData = {
        ...data,
        ingredients: data.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          subRecipeId: ing.subRecipeId,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      };

      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, cleanData as UpdateRecipeInput);
      } else {
        // Use type intersection to match store requirements without using 'any'
        await createRecipe(cleanData as Parameters<typeof createRecipe>[0]);
      }
      handleCloseForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Memoize initialData to prevent form resets
  const formInitialData = useMemo(() => {
    if (!editingRecipeId || !selectedRecipe) return undefined;

    return {
      name: selectedRecipe.name,
      servings: selectedRecipe.servings,
      currency: selectedRecipe.currency,
      category: selectedRecipe.category || undefined,
      description: selectedRecipe.description || undefined,
      prepTimeMinutes: selectedRecipe.prepTimeMinutes || undefined,
      cookingInstructions: selectedRecipe.cookingInstructions || undefined,
      sellingPrice: selectedRecipe.sellingPrice || undefined,
      targetCostPercentage: selectedRecipe.targetCostPercentage || undefined,
      wasteBufferPercentage: selectedRecipe.wasteBufferPercentage || undefined,
      ingredients: selectedRecipe.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        unit: ing.unit,
        name: ing.ingredientName,
        price: ing.currentPricePerUnit,
        ingredientUnit: ing.ingredientUnit,
        subRecipeId: ing.subRecipeId,
        isSubRecipe: !!ing.subRecipeId,
      })),
      laborSteps: selectedRecipe.laborSteps,
      overheads: selectedRecipe.overheads,
    } as Partial<RecipeFormData>;
  }, [editingRecipeId, selectedRecipe]);

  const handleEdit = async (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setIsFormOpen(true);
    // Fetch full recipe details for the form
    await fetchFullRecipe(recipe.id);
  };

  const handleDelete = async (recipe: Recipe) => {
    const isUsed = await isRecipeUsedAsSubRecipe(recipe.id);
    setRecipeToDelete(recipe);
    setIsDeletingUsageWarning(isUsed);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      await deleteRecipe(recipeToDelete.id);
      setIsDeleteDialogOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-8 pt-6 md:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        <div className="flex items-center gap-2">
          <BulkRollbackDialog />
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("recipes.addRecipe")}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("recipes.placeholders.searchRecipes")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Mobile ListView */}
      <div className="md:hidden">
        <DataCardList
          items={filteredRecipes}
          emptyMessage={t("recipes.noMatches")}
          renderItem={(recipe) => (
            <DataCard
              key={recipe.id}
              title={recipe.name}
              subtitle={recipe.category || "General"}
              onClick={() => setViewingRecipeId(recipe.id)}
              onEdit={() => handleEdit(recipe)}
              onDelete={() => handleDelete(recipe)}
              details={[
                {
                  label: "Servings",
                  value: (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold">{recipe.servings}</span>
                    </div>
                  ),
                },
                {
                  label: "Total Cost",
                  value: (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold text-primary">
                        {recipe.currency}{" "}
                        {recipe.totalCost?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  ),
                },
                {
                  label: "Margin",
                  value: (
                    <div className="flex items-center gap-1">
                      <TrendingUp
                        className={`h-3 w-3 ${
                          Number(recipe.profitMargin) > 50
                            ? "text-green-500"
                            : "text-amber-500"
                        }`}
                      />
                      <span
                        className={`font-black ${
                          Number(recipe.profitMargin) > 50
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {recipe.profitMargin?.toFixed(1) || "-"}%
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          )}
        />
        {filteredRecipes.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4">
              <ChefHat className="w-6 h-6" />
            </div>
            <p className="font-bold text-base">{t("common.messages.noData")}</p>
          </div>
        )}
      </div>

      {/* Desktop TableView */}
      <div className="hidden md:block flex-1 overflow-auto bg-card rounded-md border shadow-sm">
        <RecipeTable
          recipes={filteredRecipes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={(r) => setViewingRecipeId(r.id)}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-[900px] sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-h-[90vh] sm:rounded-lg overflow-y-auto p-4 sm:p-6 pt-6">
          <DialogHeader className="sm:p-0">
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
          <div className="sm:p-0">
            {editingRecipeId && isLoading && !selectedRecipe ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground italic">
                  Loading recipe details...
                </p>
              </div>
            ) : (
              <RecipeForm
                onSubmit={handleCreateOrUpdate}
                recipeId={editingRecipeId || undefined}
                initialData={formInitialData}
                onCancel={handleCloseForm}
                isLoading={isLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RecipeDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        recipe={recipeToDelete}
        isUsageWarning={isDeletingUsageWarning}
        onConfirm={confirmDelete}
        isLoading={isLoading}
      />

      {viewingRecipeId && (
        <RecipeDetailModal
          recipeId={viewingRecipeId}
          onClose={() => setViewingRecipeId(null)}
        />
      )}
    </div>
  );
};
