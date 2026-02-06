import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import { useTranslation } from "@/hooks/useTranslation";
import { useIngredientsStore } from "../store/ingredients.store";
import type { CreateIngredientInput, Ingredient } from "../types";
import { IngredientForm } from "./IngredientForm";
import { IngredientTable } from "./IngredientTable";

export const IngredientsPage = () => {
  const { t } = useTranslation();
  // New Store
  const {
    ingredients,
    isLoading,
    error,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    searchIngredients,
  } = useIngredientsStore();

  // Supplier store for dropdowns
  const { fetchSuppliers } = useSuppliersStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
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

  const handleCreate = async (data: CreateIngredientInput) => {
    await createIngredient(data);
    setIsCreating(false);
  };

  const handleUpdate = async (data: CreateIngredientInput) => {
    if (!editingIngredient) return;
    await updateIngredient(editingIngredient.id, data);
    setEditingIngredient(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("common.messages.confirmDelete"))) {
      await deleteIngredient(id);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-destructive">
        {t("common.messages.error")}: {error}
      </div>
    );
  }

  const renderMainContent = () => {
    if (isCreating) {
      return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            {t("ingredients.addIngredient")}
          </h2>
          <IngredientForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
            isLoading={isLoading}
          />
        </div>
      );
    }

    if (editingIngredient) {
      return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            {t("ingredients.editIngredient")}
          </h2>
          <IngredientForm
            defaultValues={editingIngredient}
            onSubmit={handleUpdate}
            onCancel={() => setEditingIngredient(null)}
            isLoading={isLoading}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("ingredients.placeholders.searchIngredients")}
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            {t("common.messages.loading")}
          </div>
        ) : (
          <IngredientTable
            ingredients={ingredients}
            onEdit={setEditingIngredient}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ingredients.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("navigation.inventory")}{" "}
            {/* Using inventory label as proxy or need specific subtext key */}
          </p>
        </div>
        {!isCreating && !editingIngredient && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={16} /> {t("ingredients.addIngredient")}
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="mt-6">{renderMainContent()}</div>
    </div>
  );
};
