import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldHelp } from "@/components/ui/field-help";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { UnitSelect } from "@/modules/core/ingredients/components/UnitSelect";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import type { Ingredient } from "@/modules/core/ingredients/types";
import { useRecipeStore } from "@/modules/core/recipes/store/recipes.store";
import { CurrencySelector } from "@/modules/core/settings/components/CurrencySelector";
import { useConfigStore } from "@/modules/core/settings/store/config.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";
import type { Recipe } from "@/types/ingredient.types";
import {
  calculateFoodCostPercentage,
  calculateIngredientCost,
  calculateProfitMargin,
  calculateRecipeTotal,
  calculateSuggestedPrice,
} from "@/utils/costEngine";
import { type Currency, getCurrencySymbol } from "@/utils/currency";
import { recipeFormSchema } from "@/utils/validators";

export type RecipeFormData = z.infer<typeof recipeFormSchema>;
const ALLERGEN_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Egg",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "Sulfites",
];
const DIETARY_OPTIONS = [
  "Gluten-Free",
  "Vegan",
  "Vegetarian",
  "Dairy-Free",
  "Low-Carb",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
];

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => Promise<void>;
  initialData?: Partial<RecipeFormData>;
  onCancel: () => void;
  isLoading?: boolean;
  recipeId?: number;
}

export const RecipeForm = ({
  onSubmit,
  initialData,
  onCancel,
  isLoading,
  recipeId,
}: RecipeFormProps) => {
  const { t } = useTranslation();
  const { ingredients: allIngredients, fetchIngredients } =
    useIngredientsStore();
  const { recipes: allRecipes, fetchRecipes } = useRecipeStore();
  const { initialize: initializeCurrency } = useCurrencyStore();
  const { getRecipeCategories } = useConfigStore();
  const categories = getRecipeCategories();
  const [componentSearch, setComponentSearch] = useState("");

  const filteredIngredients = allIngredients.filter((ing) =>
    ing.name.toLowerCase().includes(componentSearch.toLowerCase()),
  );
  const filteredRecipes = allRecipes.filter(
    (r) =>
      r.id !== recipeId &&
      r.name.toLowerCase().includes(componentSearch.toLowerCase()),
  );

  // Load ingredients, recipes and currencies if empty
  useEffect(() => {
    if (allIngredients.length === 0) fetchIngredients();
    if (allRecipes.length === 0) fetchRecipes();
    initializeCurrency();
  }, [
    allIngredients.length,
    allRecipes.length,
    fetchIngredients,
    fetchRecipes,
    initializeCurrency,
  ]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    // biome-ignore lint/suspicious/noExplicitAny: Hook Form resolver type mismatch with strict Zod schemas is a known limitation
    resolver: zodResolver(recipeFormSchema) as any,
    defaultValues: {
      name: "",
      servings: 1,
      ingredients: [],
      ...initialData,
    },
  });

  // Sync form with initialData when it changes (important for async loading)
  useEffect(() => {
    if (initialData) {
      reset({
        name: "",
        servings: 1,
        ingredients: [],
        ...initialData,
      });
    }
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const watchedIngredients = watch("ingredients");
  const watchedSellingPrice = watch("sellingPrice");
  const watchedTargetCost = watch("targetCostPercentage") || 25;
  const watchedWasteBuffer = watch("wasteBufferPercentage") || 0;

  const [costSummary, setCostSummary] = useState({
    subtotal: 0,
    wasteCost: 0,
    totalCost: 0,
    errors: [] as string[],
  });

  const watchedCurrency = watch("currency") || "USD";

  // Helper function to map sub-recipe field to cost calculation item
  const mapSubRecipeToItem = useCallback(
    (field: RecipeFormData["ingredients"][0], allRecipes: Recipe[]) => {
      const original = allRecipes.find((r) => r.id === field.subRecipeId);
      return {
        name: original?.name || "Unknown Recipe",
        quantity: field.quantity,
        unit: field.unit,
        currentPricePerUnit:
          (original?.totalCost || 0) /
          (original?.yieldAmount || original?.servings || 1),
        ingredientUnit: original?.yieldUnit || "piece",
        currency: original?.currency || "USD",
      };
    },
    [],
  );

  // Helper function to map ingredient field to cost calculation item
  const mapIngredientToItem = useCallback(
    (field: RecipeFormData["ingredients"][0], allIngredients: Ingredient[]) => {
      const original = allIngredients.find((i) => i.id === field.ingredientId);
      return {
        name: original?.name || "Unknown Ingredient",
        quantity: field.quantity,
        unit: field.unit,
        currentPricePerUnit: field.price || original?.pricePerUnit || 0,
        ingredientUnit: field.ingredientUnit || original?.unitOfMeasure || "kg",
        currency: original?.currency || "USD",
      };
    },
    [],
  );

  // Calculate Total Cost Asynchronously
  useEffect(() => {
    const updateCosts = async () => {
      const items = watchedIngredients.map((field) => {
        if (field.isSubRecipe) {
          return mapSubRecipeToItem(field, allRecipes);
        }
        return mapIngredientToItem(field, allIngredients);
      });

      const result = await calculateRecipeTotal(
        items,
        watchedWasteBuffer,
        watchedCurrency,
      );
      setCostSummary(result);
    };

    if (allIngredients.length > 0 || allRecipes.length > 0) {
      updateCosts();
    }
  }, [
    watchedIngredients,
    watchedWasteBuffer,
    watchedCurrency,
    allIngredients,
    allRecipes,
    mapSubRecipeToItem,
    mapIngredientToItem,
  ]);

  const { subtotal, wasteCost, totalCost } = costSummary;

  const suggestedPrice = calculateSuggestedPrice(totalCost, watchedTargetCost);

  // If selling price is empty, use suggested price for margin calculations
  const effectivePrice = watchedSellingPrice || suggestedPrice || 0;
  const currentMargin = calculateProfitMargin(totalCost, effectivePrice);
  const currentFoodCost = calculateFoodCostPercentage(
    totalCost,
    effectivePrice,
  );

  const handleAddIngredient = (value: string) => {
    const [type, idStr] = value.split(":");
    const id = Number(idStr);
    if (!id) return;

    if (type === "recipe") {
      const original = allRecipes.find((r) => r.id === id);
      if (original) {
        append({
          ingredientId: null,
          subRecipeId: original.id,
          isSubRecipe: true,
          quantity: 1,
          unit: original.yieldUnit || "piece",
          name: original.name,
          price:
            (original.totalCost || 0) /
            (original.yieldAmount || original.servings || 1),
          ingredientUnit: original.yieldUnit || "piece",
        });
      }
    } else {
      const original = allIngredients.find((i) => i.id === id);
      if (original) {
        append({
          ingredientId: original.id,
          subRecipeId: null,
          isSubRecipe: false,
          quantity: 1,
          unit: original.unitOfMeasure,
          name: original.name,
          price: original.pricePerUnit,
          ingredientUnit: original.unitOfMeasure,
        });
      }
    }
  };

  const submitHandler = handleSubmit((data) => {
    onSubmit(data);
  });

  const getMarginColor = (margin: number) => {
    if (margin < 20) return "text-destructive";
    if (margin < 30) return "text-yellow-600";
    return "text-green-600";
  };

  // Helper to render unit select field (reduces nesting in map callback)
  const renderUnitSelect = useCallback(
    (index: number) => (
      <Controller
        control={control}
        name={`ingredients.${index}.unit`}
        render={({ field }) => (
          <UnitSelect
            value={field.value}
            onValueChange={field.onChange}
            className="h-8 w-full text-xs"
          />
        )}
      />
    ),
    [control],
  );

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("recipes.recipeDetails")}</CardTitle>
            <CardDescription>{t("recipes.recipeDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                {t("common.labels.name")}{" "}
                <span className="text-destructive">*</span>
                <FieldHelp helpText={t("recipes.help.name")} />
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("recipes.placeholders.recipeName")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  {t("common.labels.category")}{" "}
                  <span className="text-destructive">*</span>
                  <FieldHelp helpText={t("recipes.help.category")} />
                </Label>
                <select
                  {...register("category")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive"
                  aria-invalid={!!errors.category}
                >
                  <option value="">{t("common.actions.select")}...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`common.categories.${cat}`) !==
                      `common.categories.${cat}`
                        ? t(`common.categories.${cat}`)
                        : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings" className="flex items-center gap-2">
                  {t("recipes.fields.servings")}{" "}
                  <span className="text-destructive">*</span>
                  <FieldHelp helpText={t("recipes.help.servings")} />
                </Label>
                <Input
                  type="number"
                  id="servings"
                  {...register("servings", { valueAsNumber: true })}
                  min={1}
                  aria-invalid={!!errors.servings}
                />
                {errors.servings && (
                  <p className="text-sm text-destructive">
                    {errors.servings.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prepTime" className="flex items-center gap-2">
                {t("recipes.fields.prepTime")}{" "}
                <span className="text-destructive">*</span>
                <FieldHelp helpText={t("recipes.help.prepTime")} />
              </Label>
              <Input
                type="number"
                id="prepTime"
                {...register("prepTimeMinutes", { valueAsNumber: true })}
                aria-invalid={!!errors.prepTimeMinutes}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                {t("common.labels.description")}
                <FieldHelp helpText={t("recipes.help.description")} />
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder={t("recipes.placeholders.briefOverview")}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="yieldAmount"
                  className="flex items-center gap-2"
                >
                  {t("recipes.fields.batchYield")}
                  <FieldHelp helpText="The total quantity this recipe produces (e.g. 5 for 5kg)." />
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  id="yieldAmount"
                  {...register("yieldAmount", { valueAsNumber: true })}
                  placeholder={t("recipes.placeholders.yield")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yieldUnit" className="flex items-center gap-2">
                  {t("recipes.fields.yieldUnit")}
                  <FieldHelp helpText="The unit for the batch yield (e.g. kg, L, pieces)." />
                </Label>
                <Controller
                  control={control}
                  name="yieldUnit"
                  render={({ field }) => (
                    <UnitSelect
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      placeholder={t("recipes.placeholders.yieldUnit")}
                      className="h-9"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories" className="flex items-center gap-2">
                {t("recipes.fields.calories")}
                <FieldHelp helpText="Estimated calorie count per serving." />
              </Label>
              <Input
                type="number"
                id="calories"
                {...register("calories", { valueAsNumber: true })}
                placeholder={t("recipes.placeholders.calories")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t("recipes.financials")}</CardTitle>
            <CardDescription>{t("recipes.financialsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="flex items-center gap-2">
                {t("recipes.fields.sellingPrice")}
                <span className="ml-2 text-[10px] text-muted-foreground uppercase opacity-70">
                  (Optional)
                </span>
                <FieldHelp helpText={t("recipes.help.sellingPrice")} />
              </Label>
              <Input
                type="number"
                step="0.01"
                id="sellingPrice"
                {...register("sellingPrice", { valueAsNumber: true })}
                placeholder={
                  suggestedPrice > 0
                    ? suggestedPrice.toFixed(2)
                    : t("recipes.placeholders.sellingPrice")
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("common.labels.currency")}</Label>
              <CurrencySelector
                value={watch("currency") ?? "USD"}
                onChange={(value) => setValue("currency", value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="targetCost" className="flex items-center gap-2">
                  {t("recipes.fields.targetCostPercentage")}
                  <FieldHelp
                    helpText={t("recipes.help.targetCostPercentage")}
                  />
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {t("recipes.default")}: 25%
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  id="targetCost"
                  {...register("targetCostPercentage", { valueAsNumber: true })}
                  placeholder="25"
                />
                <div className="flex gap-1">
                  {[20, 25, 30].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="px-2"
                      onClick={() => setValue("targetCostPercentage", val)}
                    >
                      {val}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="wasteBuffer"
                  className="flex items-center gap-2"
                >
                  {t("recipes.fields.wasteBuffer")}
                  <FieldHelp helpText={t("recipes.help.wasteBuffer")} />
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {t("recipes.placeholders.yield")}%
                </span>
              </div>
              <Input
                type="number"
                id="wasteBuffer"
                {...register("wasteBufferPercentage", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="mt-6 p-4 bg-muted/30 border border-border/50 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("recipes.subtotal")}:
                </span>
                <span className="font-medium">
                  {getCurrencySymbol(watch("currency") || "USD")}
                  {subtotal.toFixed(2)}
                </span>
              </div>

              {watchedWasteBuffer > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {t("recipes.fields.wasteBuffer").replace("%", "").trim()} (
                    {watchedWasteBuffer}%):
                  </span>
                  <span className="font-medium text-orange-600">
                    +{getCurrencySymbol(watch("currency") || "USD")}
                    {wasteCost.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="h-px bg-border/50 my-2" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold">
                  {t("recipes.trueCost")}:
                </span>
                <span className="font-bold text-lg">
                  {getCurrencySymbol(watch("currency") || "USD")}
                  {totalCost.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("recipes.suggestedPrice")} ({watchedTargetCost}%{" "}
                  {t("recipes.cost")}):
                </span>
                <span className="font-semibold text-primary">
                  {getCurrencySymbol(watch("currency") || "USD")}
                  {Number.isFinite(suggestedPrice)
                    ? suggestedPrice.toFixed(2)
                    : "0.00"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground text-xs italic">
                  {watchedSellingPrice
                    ? t("recipes.actualCost")
                    : t("recipes.targetCost")}
                  :
                </span>
                <span
                  className={`font-medium ${getMarginColor(100 - currentFoodCost)}`}
                >
                  {currentFoodCost.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  {watchedSellingPrice
                    ? t("recipes.netMargin")
                    : t("recipes.targetMargin")}
                  :
                </span>
                <span className={`font-bold ${getMarginColor(currentMargin)}`}>
                  {currentMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recipes.allergens")}</CardTitle>
            <CardDescription>{t("recipes.allergensDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {t("recipes.commonAllergens")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((allergen) => {
                  const currentAllergens = watch("allergens") || [];
                  const isSelected = currentAllergens.includes(allergen);
                  return (
                    <Button
                      key={allergen}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`h-7 px-3 text-xs ${
                        isSelected
                          ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                          : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setValue(
                            "allergens",
                            currentAllergens.filter((a) => a !== allergen),
                          );
                        } else {
                          setValue("allergens", [
                            ...currentAllergens,
                            allergen,
                          ]);
                        }
                      }}
                    >
                      {allergen}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {t("recipes.dietaryRestrictions")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((diet) => {
                  const currentDiets = watch("dietaryRestrictions") || [];
                  const isSelected = currentDiets.includes(diet);
                  return (
                    <Button
                      key={diet}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`h-7 px-3 text-xs ${
                        isSelected
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                          : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setValue(
                            "dietaryRestrictions",
                            currentDiets.filter((d) => d !== diet),
                          );
                        } else {
                          setValue("dietaryRestrictions", [
                            ...currentDiets,
                            diet,
                          ]);
                        }
                      }}
                    >
                      {diet}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("recipes.ingredientsTitle")}</CardTitle>
            <CardDescription>{t("recipes.ingredientsDesc")}</CardDescription>
          </div>
          <Select
            onValueChange={handleAddIngredient}
            onOpenChange={(open) => !open && setComponentSearch("")}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t("recipes.addComponent")} />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b sticky top-0 bg-popover z-20">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("recipes.placeholders.searchComponents")}
                    className="pl-8 h-8"
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              {filteredIngredients.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/50">
                    {t("navigation.ingredients")}
                  </div>
                  {filteredIngredients.map((ing) => (
                    <SelectItem key={ing.id} value={`ingredient:${ing.id}`}>
                      {ing.name} ({ing.unitOfMeasure})
                    </SelectItem>
                  ))}
                </>
              )}
              {filteredRecipes.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/50 mt-2">
                    {t("recipes.subRecipes")}
                  </div>
                  {filteredRecipes.map((r) => (
                    <SelectItem key={r.id} value={`recipe:${r.id}`}>
                      {r.name} ({r.yieldUnit || "piece"})
                    </SelectItem>
                  ))}
                </>
              )}
              {filteredIngredients.length === 0 &&
                filteredRecipes.length === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    {t("recipes.noMatches")}
                  </div>
                )}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                    {t("common.labels.name")}
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">
                    {t("common.labels.quantity")}
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[120px]">
                    {t("common.labels.unit")}
                  </th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">
                    {t("recipes.cost")}
                  </th>
                  <th className="h-10 px-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span>{field.name || "Loading..."}</span>
                        {watchedIngredients[index]?.isSubRecipe && (
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                            Sub-Recipe
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8"
                        {...register(`ingredients.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </td>
                    <td className="p-4 align-middle">
                      {renderUnitSelect(index)}
                    </td>
                    <td className="p-4 align-middle text-right font-mono">
                      <CostDisplay
                        quantity={watchedIngredients[index]?.quantity || 0}
                        unit={watchedIngredients[index]?.unit || "kg"}
                        basePrice={watchedIngredients[index]?.price || 0}
                        baseUnit={
                          watchedIngredients[index]?.ingredientUnit || "kg"
                        }
                        currency={watch("currency") || "USD"}
                      />
                    </td>
                    <td className="p-4 align-middle">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No ingredients added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cooking Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("cookingInstructions")}
            placeholder="Step by step preparation guide..."
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {initialData?.name ? "Update Recipe" : "Save Recipe"}
        </Button>
      </div>
    </form>
  );
};

// Sub-component
const CostDisplay = ({
  quantity,
  unit,
  basePrice,
  baseUnit,
  currency,
}: {
  quantity: number;
  unit: string;
  basePrice: number;
  baseUnit: string;
  currency: Currency;
}) => {
  const { cost, error } = calculateIngredientCost(
    quantity,
    unit,
    basePrice,
    baseUnit,
  );
  if (error)
    return (
      <span className="text-destructive text-xs" title={error}>
        !
      </span>
    );

  return (
    <span>
      {getCurrencySymbol(currency)}
      {cost.toFixed(2)}
    </span>
  );
};
