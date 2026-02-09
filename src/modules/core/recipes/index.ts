import { ChefHat } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { RecipesPage } from "./components/RecipesPage";

export { RecipesPage } from "./components/RecipesPage";
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
