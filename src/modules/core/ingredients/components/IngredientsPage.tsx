import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { useSuppliersStore } from "@/modules/core/suppliers/store/suppliers.store";
import { useIngredientsStore } from "../store/ingredients.store";
import type { CreateIngredientInput, Ingredient } from "../types";
import { IngredientForm } from "./IngredientForm";
import { IngredientTable } from "./IngredientTable";

export const IngredientsPage = () => {
  const { t } = useTranslation();

  const {
    ingredients,
    isLoading,
    error,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    archiveIngredient,
    searchIngredients,
  } = useIngredientsStore();

  const { fetchSuppliers } = useSuppliersStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [ingredientToDelete, setIngredientToDelete] =
    useState<Ingredient | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIngredients();
    fetchSuppliers();
  }, [fetchIngredients, fetchSuppliers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchIngredients(query);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIngredient(null);
  };

  const handleCreateOrUpdate = async (data: CreateIngredientInput) => {
    if (editingIngredient) {
      await updateIngredient(editingIngredient.id, data);
    } else {
      await createIngredient(data);
    }
    handleCloseForm();
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsFormOpen(true);
  };

  /**
   * Replaced hard delete with archive to preserve recipe history
   * and avoid FK constraint errors.
   */
  const handleDelete = (id: number) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (ingredient) {
      setIngredientToDelete(ingredient);
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (ingredientToDelete) {
      await archiveIngredient(ingredientToDelete.id);
      setIsDeleteConfirmOpen(false);
      setIngredientToDelete(null);
    }
  };

  // Mobile check removed

  return (
    <div className="flex flex-col h-full md:p-8 p-0">
      {/* Header - Desktop Only */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("ingredients.title")}
          </h2>
          <p className="text-muted-foreground">{t("ingredients.subtitle")}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("ingredients.addIngredient")}
        </Button>
      </div>

      {/* Sticky Header - Mobile Only */}
      <div className="flex md:hidden items-center gap-3 sticky top-0 bg-background/80 backdrop-blur-xl z-20 py-4 px-4 border-b border-muted/20">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t("ingredients.placeholders.searchIngredients")}
            value={searchQuery}
            onChange={handleSearch}
            className="pl-12 h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner text-base"
          />
        </div>
        <Button
          size="icon"
          className="rounded-2xl size-14 shrink-0 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      <div className="hidden md:block mb-6">
        <Separator />
      </div>

      {/* Search Bar - Desktop Only */}
      <div className="hidden md:flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("ingredients.placeholders.searchIngredients")}
            value={searchQuery}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4 mx-4 md:mx-0">
          {error}
        </div>
      )}

      {/* Ingredient Count - Mobile Only */}
      <div className="md:hidden mb-2 px-4 pt-2">
        <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
          {ingredients.length} {t("ingredients.title")}
        </h2>
      </div>

      <div className="flex-1 overflow-auto bg-transparent md:bg-card md:rounded-md md:border md:shadow-sm px-4 md:px-0">
        {/* Mobile View */}
        <div className="md:hidden">
          <DataCardList
            items={ingredients}
            renderItem={(ingredient) => (
              <DataCard
                key={ingredient.id}
                title={ingredient.name}
                subtitle={ingredient.category || "Uncategorized"}
                onClick={() => handleEdit(ingredient)}
                details={[
                  {
                    label: "Price",
                    value: `$${(ingredient.pricePerUnit || 0).toFixed(2)} / ${ingredient.unitOfMeasure}`,
                  },
                  {
                    label: "Stock",
                    value: `${ingredient.currentStock} ${ingredient.unitOfMeasure}`,
                  },
                ]}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ingredient.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            )}
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <IngredientTable
            ingredients={ingredients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {ingredients.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="font-bold text-lg">{t("common.messages.noData")}</p>
            <p className="text-sm">{t("ingredients.noMatches")}</p>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-[600px] sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-h-[90vh] sm:rounded-lg overflow-y-auto p-0 sm:p-6 border-x-0 sm:border">
          <DialogHeader className="p-4 md:p-0 mb-0 md:mb-4 bg-background sticky top-0 z-10 border-b md:border-0">
            <DialogTitle>
              {editingIngredient
                ? t("ingredients.editIngredient")
                : t("ingredients.addIngredient")}
            </DialogTitle>
            <DialogDescription>
              {editingIngredient
                ? t("ingredients.prompts.update")
                : t("ingredients.prompts.add")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 md:p-0 pt-0">
            <IngredientForm
              defaultValues={editingIngredient ?? undefined}
              onSubmit={handleCreateOrUpdate}
              onCancel={handleCloseForm}
              isLoading={isLoading}
              isEdit={!!editingIngredient}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="w-[90vw] md:w-full rounded-2xl md:rounded-lg">
          <DialogHeader>
            <DialogTitle>{t("ingredients.archive.title")}</DialogTitle>
            <DialogDescription>
              {t("ingredients.archive.message", {
                name: ingredientToDelete?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse md:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full md:w-auto"
            >
              {t("common.actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading
                ? t("ingredients.archive.progress")
                : t("ingredients.archive.action")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
