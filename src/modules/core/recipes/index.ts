import { ChefHat } from "lucide-react";
import React from "react";
import type { ModuleDefinition } from "@/types/module";

const RecipesPage = React.lazy(() =>
  import("@/components/pages/RecipesPage/RecipesPage").then((m) => ({
    default: m.RecipesPage,
  })),
);

export { RecipesPage } from "@/components/pages/RecipesPage/RecipesPage";
export { recipesRepository } from "./services/recipes.repository";
export { useRecipeStore } from "./store/recipes.store";

export const recipesModule: ModuleDefinition = {
  id: "recipes",
  title: "Recipes",
  icon: ChefHat,
  component: RecipesPage,
  order: 20,
  isCore: true,
  description: "Manage recipes, costs, and versions",
};
