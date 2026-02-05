import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRecipeStore } from "@/store/recipeStore";
import { RecipeTable } from "@/components/organisms/RecipeTable";
import { RecipeForm } from "@/components/organisms/RecipeForm";
import { Button } from "@/components/atoms/Button";
import { SearchBar } from "@/components/molecules/SearchBar";
import styles from "./RecipesPage.module.css";

export const RecipesPage = () => {
    const { recipes, fetchRecipes, createRecipe, isLoading, error, searchQuery, setSearchQuery } = useRecipeStore();
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
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

            {error && <div style={{ color: "var(--color-error)", marginBottom: "1rem" }}>{error}</div>}
            {isLoading && <div style={{ marginBottom: "1rem", color: "var(--color-neutral-500)" }}>Loading recipes...</div>}

            <RecipeTable
                recipes={filteredRecipes}
                onEdit={(r) => console.log("Edit", r)}
                onDelete={(id) => console.log("Delete", id)}
                onView={(r) => console.log("View", r)}
            />

            {isFormOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <RecipeForm
                            onSubmit={async (data) => {
                                await createRecipe(data);
                                setIsFormOpen(false);
                            }}
                            onCancel={() => setIsFormOpen(false)}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
