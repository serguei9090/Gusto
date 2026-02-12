import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "@/hooks/useTranslation";
import { useMobileComponent } from "@/lib/mobile-registry";
import { useSuppliersStore } from "@/modules/core/suppliers/store/suppliers.store";
import { useIngredientsStore } from "../store/ingredients.store";
import type { CreateIngredientInput, Ingredient } from "../types";
import { IngredientForm } from "./IngredientForm";
import { IngredientTable } from "./IngredientTable";

export const IngredientsPage = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const MobileComponent = useMobileComponent("MobileIngredients");

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

  if (isMobile && MobileComponent) {
    return (
      <div className="h-full">
        <MobileComponent
          ingredients={ingredients}
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          setIsFormOpen={setIsFormOpen}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          error={error}
          t={t}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="w-full max-w-full rounded-none border-x-0 p-4 pt-6 top-16 translate-y-0 h-full max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-1 mb-2">
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
            <IngredientForm
              defaultValues={editingIngredient ?? undefined}
              onSubmit={handleCreateOrUpdate}
              onCancel={handleCloseForm}
              isLoading={isLoading}
              isEdit={!!editingIngredient}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <DialogContent className="w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>{t("ingredients.archive.title")}</DialogTitle>
              <DialogDescription>
                {t("ingredients.archive.message", {
                  name: ingredientToDelete?.name,
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-full"
              >
                {t("common.actions.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isLoading}
                className="w-full"
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
  }

  return (
    <div className="flex flex-col space-y-6 h-full p-8">
      <div className="flex items-center justify-between">
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

      <Separator />

      <div className="flex items-center space-x-2">
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
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto bg-card rounded-md border shadow-sm">
        <IngredientTable
          ingredients={ingredients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
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
          <IngredientForm
            defaultValues={editingIngredient ?? undefined}
            onSubmit={handleCreateOrUpdate}
            onCancel={handleCloseForm}
            isLoading={isLoading}
            isEdit={!!editingIngredient}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ingredients.archive.title")}</DialogTitle>
            <DialogDescription>
              {t("ingredients.archive.message", {
                name: ingredientToDelete?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              {t("common.actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
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
