import { ShoppingBasket } from "lucide-react";
import type { ModuleDefinition } from "@/types/module";
import { IngredientsPage } from "./components/IngredientsPage";

export * from "./components/IngredientForm";
export * from "./components/IngredientsPage";
export * from "./components/IngredientTable";
export * from "./services/ingredients.repository";
export * from "./store/ingredients.store";
export * from "./types";

export const ingredientsModule: ModuleDefinition = {
  id: "ingredients",
  title: "Ingredients",
  icon: ShoppingBasket,
  component: IngredientsPage,
  order: 10,
  isCore: true,
  description: "Manage ingredients and stock levels",
};
