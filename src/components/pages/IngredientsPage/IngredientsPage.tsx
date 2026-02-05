import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useIngredientsStore, IngredientTable, IngredientForm } from "@/features/ingredients";
import { useSupplierStore } from "@/store/supplierStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Ingredient, CreateIngredientInput } from "@/features/ingredients";

export const IngredientsPage = () => {
    // New Store
    const {
        ingredients,
        isLoading,
        error,
        fetchIngredients,
        createIngredient,
        updateIngredient,
        deleteIngredient,
        searchIngredients
    } = useIngredientsStore();

    // Supplier store for dropdowns (still global for now)
    const { fetchSuppliers } = useSupplierStore();

    const [isCreating, setIsCreating] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
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
        if (confirm("Are you sure you want to delete this ingredient?")) {
            await deleteIngredient(id);
        }
    };

    if (error) {
        return <div className="p-4 text-destructive">Error: {error}</div>;
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ingredients</h1>
                    <p className="text-muted-foreground">Manage your kitchen inventory and costs.</p>
                </div>
                {!isCreating && !editingIngredient && (
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus size={16} /> Add Ingredient
                    </Button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="mt-6">
                {isCreating ? (
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-6">Add New Ingredient</h2>
                        <IngredientForm
                            onSubmit={handleCreate}
                            onCancel={() => setIsCreating(false)}
                            isLoading={isLoading}
                        />
                    </div>
                ) : editingIngredient ? (
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-6">Edit Ingredient</h2>
                        <IngredientForm
                            defaultValues={editingIngredient}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingIngredient(null)}
                            isLoading={isLoading}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search ingredients..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="pl-10 max-w-sm"
                            />
                        </div>

                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground">Loading ingredients...</div>
                        ) : (
                            <IngredientTable
                                ingredients={ingredients}
                                onEdit={setEditingIngredient}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
