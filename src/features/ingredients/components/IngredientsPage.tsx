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
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import { useTranslation } from "@/hooks/useTranslation";
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

  /*
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

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("ingredients.title")}
          </h2>
          <p className="text-muted-foreground">
            Manage your ingredient inventory and track costs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("ingredients.addIngredient")}
          </Button>
        </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient
                ? t("ingredients.editIngredient")
                : t("ingredients.addIngredient")}
            </DialogTitle>
            <DialogDescription>
              {editingIngredient
                ? "Update the ingredient details below."
                : "Fill out the form below to add a new ingredient to your inventory."}
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
            <DialogTitle>Archive Ingredient</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive "{ingredientToDelete?.name}"? It
              will be removed from the master list but will remain in existing
              recipes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
