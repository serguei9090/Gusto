import { zodResolver } from "@hookform/resolvers/zod";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { AlertTriangle, ChevronDown, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { CurrencySelector } from "@/components/molecules/CurrencySelector";
import { UnitSelect } from "@/components/molecules/UnitSelect";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { MobileFormFooter } from "@/components/ui/mobile-form-footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { LaborStepsTable } from "@/modules/core/finance/components/molecules/LaborStepsTable";
import { financeService } from "@/modules/core/finance/services/finance.service";
import type { CostBreakdown } from "@/modules/core/finance/types";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import type { Ingredient } from "@/modules/core/ingredients/types";
import { useRecipeStore } from "@/modules/core/recipes/store/recipes.store";
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

  // Load ingredients, recipes and currencies on mount
  useEffect(() => {
    fetchIngredients();
    fetchRecipes();
    initializeCurrency();
  }, [fetchIngredients, fetchRecipes, initializeCurrency]);

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
      laborSteps: [],
      overheads: {
        variable_overhead_rate: 0,
        fixed_overhead_buffer: 0,
        labor_tax_rates: [],
      },
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

  // Watch detailed changes in ingredients array to ensure re-renders
  const watchedIngredients = useWatch({
    control,
    name: "ingredients",
  });
  const watchedSellingPrice = watch("sellingPrice");
  const watchedTargetCost = watch("targetCostPercentage") || 25;
  const watchedWasteBuffer = watch("wasteBufferPercentage") || 0;
  const watchedLaborSteps = watch("laborSteps") || [];
  const watchedOverheads = watch("overheads");

  const [standardCost, setStandardCost] = useState<CostBreakdown | null>(null);

  // Filter recipes based on current recipe type
  // Base recipes can only import other base recipes
  const currentIsBaseRecipe = watch("isBaseRecipe");
  const filteredRecipes = allRecipes.filter((r) => {
    const matchesSearch = r.name
      .toLowerCase()
      .includes(componentSearch.toLowerCase());
    const isNotSelf = r.id !== recipeId;

    // If current recipe is a base recipe, only show other base recipes
    if (currentIsBaseRecipe) {
      return matchesSearch && isNotSelf && r.isBaseRecipe === true;
    }

    // Regular recipes can import any base recipe ONLY
    // "Base recipes can only import other base recipes" remains true above.
    // "Regular recipes can import any base recipe" means they CANNOT import regular recipes.
    return matchesSearch && isNotSelf && r.isBaseRecipe === true;
  });

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
    let isCancelled = false;

    const updateCosts = async () => {
      const items = (watchedIngredients || []).map(
        (field: RecipeFormData["ingredients"][0]) => {
          if (field.isSubRecipe) {
            return mapSubRecipeToItem(field, allRecipes);
          }
          return mapIngredientToItem(field, allIngredients);
        },
      );

      const result = await calculateRecipeTotal(
        items,
        watchedWasteBuffer,
        watchedCurrency,
      );

      console.log("Cost Calculation Update:", { items, result });

      if (!isCancelled) {
        setCostSummary(result);
      }
    };

    if (allIngredients.length > 0 || allRecipes.length > 0) {
      updateCosts();
    }

    return () => {
      isCancelled = true;
    };
  }, [
    watchedIngredients,
    watchedWasteBuffer,
    watchedCurrency,
    allIngredients,
    allRecipes,
    mapSubRecipeToItem,
    mapIngredientToItem,
  ]);

  // Calculate Standard Cost (Rust Engine)
  useEffect(() => {
    const calculateStandard = async () => {
      // Actually, we should use the `costSummary` logic to get the real line items costs?
      // For now, let's pass a simplified list to Rust to avoid re-implementing unit conversion there yet.
      // We will pass 1 aggregate ingredient representing the Total Material Cost.

      const materialCost = costSummary.totalCost; // Includes waste

      const input = {
        ingredients: [
          {
            quantity: 1,
            cost_per_unit: materialCost,
            yield_percent: 1,
          },
        ],
        labor_steps: watchedLaborSteps.map((s) => ({
          ...s,
          // Ensure inputs are numbers
          workers: Number(s.workers),
          time_minutes: Number(s.time_minutes),
          hourly_rate: Number(s.hourly_rate),
        })),
        overheads: {
          variable_overhead_rate: Number(
            watchedOverheads?.variable_overhead_rate || 0,
          ),
          fixed_overhead_buffer: Number(
            watchedOverheads?.fixed_overhead_buffer || 0,
          ),
          labor_tax_rates: watchedOverheads?.labor_tax_rates?.map(Number) || [],
        },
        waste_buffer_percent: 0, // Already applied in materialCost
      };

      try {
        const result = await financeService.calculateStandardCost(input);
        setStandardCost(result);
      } catch (e) {
        console.error(e);
      }
    };

    calculateStandard();
  }, [costSummary.totalCost, watchedLaborSteps, watchedOverheads]);

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
    // Logic: If user didn't set a manual selling price, use the calculated suggested price
    const finalSellingPrice =
      data.sellingPrice ||
      (suggestedPrice > 0 ? Number(suggestedPrice.toFixed(2)) : 0);

    onSubmit({
      ...data,
      sellingPrice: finalSellingPrice,
    });
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
            className="h-10 w-full"
          />
        )}
      />
    ),
    [control],
  );

  return (
    <form onSubmit={submitHandler} className="space-y-6 pb-0">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("recipes.recipeDetails")}</CardTitle>
            <CardDescription>{t("recipes.recipeDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costSummary.errors && costSummary.errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Calculation Errors</p>
                  <ul className="list-disc list-inside text-xs opacity-90">
                    {costSummary.errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {/* Recipe Type Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Recipe Type
                <FieldHelp helpText="Base Recipes are templates that can be used in other recipes. Regular Recipes are production recipes." />
              </Label>
              <Controller
                control={control}
                name="isBaseRecipe"
                render={({ field }) => (
                  <Tabs
                    value={field.value ? "base" : "production"}
                    onValueChange={(value) => field.onChange(value === "base")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="production"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Recipe
                      </TabsTrigger>
                      <TabsTrigger
                        value="base"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Base Recipe
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              />
              {watch("isBaseRecipe") && (
                <p className="text-xs text-muted-foreground italic">
                  Base recipes can only import other base recipes
                </p>
              )}
            </div>

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
                className="h-12"
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
                  {t("common.labels.category")}
                  <FieldHelp helpText={t("recipes.help.category")} />
                </Label>
                <select
                  {...register("category")}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive"
                  aria-invalid={!!errors.category}
                >
                  <option value="">{t("common.actions.select")}...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`common.categories.${cat}`) ===
                      `common.categories.${cat}`
                        ? cat.charAt(0).toUpperCase() + cat.slice(1)
                        : t(`common.categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings" className="flex items-center gap-2">
                  {t("recipes.fields.servings")}
                  <FieldHelp helpText={t("recipes.help.servings")} />
                </Label>
                <Input
                  type="number"
                  id="servings"
                  {...register("servings", { valueAsNumber: true })}
                  min={1}
                  aria-invalid={!!errors.servings}
                  className="h-12"
                  onFocus={(e) => e.target.select()}
                />
                {errors.servings && (
                  <p className="text-sm text-destructive">
                    {errors.servings.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Section */}
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
              <SelectTrigger className="w-[220px] h-12">
                <SelectValue placeholder={t("recipes.addComponent")} />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 border-b sticky top-0 bg-popover z-20">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("recipes.placeholders.searchComponents")}
                      className="pl-8 h-12"
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
                          {!watchedIngredients[index]?.price && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                              <AlertTriangle className="h-3 w-3" />
                              Zero Price
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-10"
                          {...register(`ingredients.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          onFocus={(e) => e.target.select()}
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
                          className="h-10 w-10 text-destructive hover:text-destructive/90"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-5 w-5" />
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

        {/* Description & Instructions Card */}
        {/* Description & Instructions - Collapsible Section */}
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="description-instructions"
              className="border-0"
            >
              <CardHeader className="pb-0">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start text-left gap-1">
                    <CardTitle>Description & Instructions</CardTitle>
                    <CardDescription>
                      Main overview and step-by-step preparation guide
                    </CardDescription>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-2"
                    >
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
                  <div className="space-y-2">
                    <Label
                      htmlFor="cookingInstructions"
                      className="flex items-center gap-2"
                    >
                      Cooking Instructions
                      <FieldHelp helpText="Step by step preparation guide..." />
                    </Label>
                    <Textarea
                      id="cookingInstructions"
                      {...register("cookingInstructions")}
                      placeholder="Step by step preparation guide..."
                      className="min-h-[150px]"
                    />
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Financials - Labor & Overhead */}
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="financials" className="border-0">
              <CardHeader className="pb-0">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start text-left gap-1">
                    <CardTitle className="flex items-center gap-2">
                      Advanced Financials (Standard Costing)
                      {standardCost && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          Prime: {getCurrencySymbol(watchedCurrency)}
                          {standardCost.prime_cost.toFixed(2)}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Configure labor steps and overheads for accurate pricing
                    </CardDescription>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <Label>Direct Labor Steps</Label>
                    <LaborStepsTable
                      steps={watchedLaborSteps}
                      onChange={(steps) => setValue("laborSteps", steps)}
                      currencySymbol={getCurrencySymbol(watchedCurrency)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Variable Overhead Rate (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register("overheads.variable_overhead_rate", {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="text-muted-foreground text-sm">
                          % of Labor
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Standard for Gas, Water, Electricity
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Labor Taxes (Social Security etc)</Label>
                      {/* Simplified for now - can extend to list */}
                      <div className="p-2 border rounded text-sm text-muted-foreground bg-muted">
                        Detailed Tax configuration available in Finance Module
                        settings.
                      </div>
                    </div>
                  </div>

                  {standardCost && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2 border">
                      <h4 className="font-semibold text-sm">
                        True Cost Breakdown (Fully Loaded)
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Raw Materials:</div>
                        <div className="text-right">
                          {getCurrencySymbol(watchedCurrency)}
                          {standardCost.raw_materials.toFixed(2)}
                        </div>

                        <div>Direct Labor:</div>
                        <div className="text-right">
                          {getCurrencySymbol(watchedCurrency)}
                          {standardCost.direct_labor.toFixed(2)}
                        </div>

                        <div>Labor Taxes:</div>
                        <div className="text-right">
                          {getCurrencySymbol(watchedCurrency)}
                          {standardCost.labor_taxes.toFixed(2)}
                        </div>

                        <div className="font-medium">Prime Cost:</div>
                        <div className="text-right font-medium">
                          {getCurrencySymbol(watchedCurrency)}
                          {standardCost.prime_cost.toFixed(2)}
                        </div>

                        <div>Var. Overhead:</div>
                        <div className="text-right">
                          {getCurrencySymbol(watchedCurrency)}
                          {standardCost.variable_overhead.toFixed(2)}
                        </div>

                        <div className="font-bold border-t pt-1 mt-1">
                          TOTAL COST:
                        </div>
                        <div className="text-right font-bold border-t pt-1 mt-1">
                          {getCurrencySymbol(watchedCurrency)}
                          {standardCost.fully_loaded_cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Additional Information - Collapsible Section */}
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional-info" className="border-0">
              <CardHeader className="pb-0">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start text-left gap-1">
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Optional details: prep time, nutritional data, and
                      allergens
                    </CardDescription>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="prepTime"
                          className="flex items-center gap-2"
                        >
                          {t("recipes.fields.prepTime")}
                          <FieldHelp helpText={t("recipes.help.prepTime")} />
                        </Label>
                        <Input
                          type="number"
                          id="prepTime"
                          {...register("prepTimeMinutes", {
                            valueAsNumber: true,
                          })}
                          aria-invalid={!!errors.prepTimeMinutes}
                          className="h-12"
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
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
                            {...register("yieldAmount", {
                              valueAsNumber: true,
                            })}
                            placeholder={t("recipes.placeholders.yield")}
                            className="h-12"
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="yieldUnit"
                            className="flex items-center gap-2"
                          >
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
                                placeholder={t(
                                  "recipes.placeholders.yieldUnit",
                                )}
                                className="h-12"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="calories"
                          className="flex items-center gap-2"
                        >
                          {t("recipes.fields.calories")}
                          <FieldHelp helpText="Estimated calorie count per serving." />
                        </Label>
                        <Input
                          type="number"
                          id="calories"
                          {...register("calories", { valueAsNumber: true })}
                          placeholder={t("recipes.placeholders.calories")}
                          className="h-12"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>

                    {/* Right Column - Allergens & Dietary */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          {t("recipes.commonAllergens")}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {ALLERGEN_OPTIONS.map((allergen) => {
                            const currentAllergens = watch("allergens") || [];
                            const isSelected =
                              currentAllergens.includes(allergen);
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
                                      currentAllergens.filter(
                                        (a) => a !== allergen,
                                      ),
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
                            const currentDiets =
                              watch("dietaryRestrictions") || [];
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
                    </div>
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Financials - Collapsible Section */}
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="financials" className="border-0">
              <AccordionPrimitive.Header className="flex">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full border-b hover:bg-muted/30 transition-colors group">
                  <AccordionPrimitive.Trigger
                    className="flex flex-1 items-center justify-between py-6 pl-6 text-left focus:outline-none"
                    asChild
                  >
                    <button type="button" className="flex-1 text-left">
                      <div className="flex flex-col gap-1 min-w-[200px]">
                        <CardTitle>{t("recipes.financials")}</CardTitle>
                        <CardDescription>
                          {t("recipes.financialsDesc")}
                        </CardDescription>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 ml-4 lg:hidden" />
                    </button>
                  </AccordionPrimitive.Trigger>

                  <div className="flex flex-wrap items-center gap-6 px-6 pb-6 lg:pb-0">
                    {/* Target Cost Fast Select */}
                    <fieldset
                      className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                        }
                      }}
                      aria-label="Fast select target cost"
                    >
                      <legend className="sr-only">
                        Fast select target cost
                      </legend>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground px-2">
                        Target
                      </span>
                      {[20, 25, 30].map((val) => (
                        <Button
                          key={val}
                          type="button"
                          variant={
                            watchedTargetCost === val ? "default" : "ghost"
                          }
                          size="sm"
                          className={`h-8 px-3 text-xs font-bold ${
                            watchedTargetCost === val
                              ? "shadow-sm"
                              : "hover:bg-background"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setValue("targetCostPercentage", val);
                          }}
                        >
                          {val}%
                        </Button>
                      ))}
                    </fieldset>

                    {/* Summary Metrics Display */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-2 border-l pl-6 border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                          Subtotal
                        </span>
                        <span className="text-sm font-semibold whitespace-nowrap">
                          {getCurrencySymbol(watch("currency") || "USD")}
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 whitespace-nowrap">
                          True Cost
                        </span>
                        <span className="text-sm font-bold whitespace-nowrap">
                          {getCurrencySymbol(watch("currency") || "USD")}
                          {totalCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 whitespace-nowrap">
                          Suggested ({watchedTargetCost}%)
                        </span>
                        <span className="text-sm font-bold text-primary whitespace-nowrap">
                          {getCurrencySymbol(watch("currency") || "USD")}
                          {Number.isFinite(suggestedPrice)
                            ? suggestedPrice.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 whitespace-nowrap">
                          Target Food Cost
                        </span>
                        <span
                          className={`text-sm font-bold whitespace-nowrap ${getMarginColor(
                            100 - currentFoodCost,
                          )}`}
                        >
                          {currentFoodCost.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 whitespace-nowrap">
                          Target Margin
                        </span>
                        <span
                          className={`text-sm font-bold whitespace-nowrap ${getMarginColor(
                            currentMargin,
                          )}`}
                        >
                          {currentMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <AccordionPrimitive.Trigger asChild>
                      <button
                        type="button"
                        className="hidden lg:flex p-2 hover:bg-muted rounded-full transition-colors order-last focus:outline-none"
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </button>
                    </AccordionPrimitive.Trigger>
                  </div>
                </div>
              </AccordionPrimitive.Header>
              <AccordionContent>
                <CardContent className="space-y-6 pt-6 border-t border-border/30 mx-6 bg-muted/5 rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="sellingPrice"
                          className="flex items-center gap-2"
                        >
                          {t("recipes.fields.sellingPrice")}
                          <span className="ml-2 text-[10px] text-muted-foreground uppercase opacity-70">
                            (Optional)
                          </span>
                          <FieldHelp
                            helpText={t("recipes.help.sellingPrice")}
                          />
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
                          className="h-12 text-lg font-semibold"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">
                          {t("common.labels.currency")}
                        </Label>
                        <CurrencySelector
                          value={watch("currency") ?? "USD"}
                          onChange={(value) => setValue("currency", value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label
                            htmlFor="targetCost"
                            className="flex items-center gap-2"
                          >
                            {t("recipes.fields.targetCostPercentage")}
                            <FieldHelp
                              helpText={t("recipes.help.targetCostPercentage")}
                            />
                          </Label>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {t("recipes.default")}: 25%
                          </span>
                        </div>
                        <Input
                          type="number"
                          id="targetCost"
                          {...register("targetCostPercentage", {
                            valueAsNumber: true,
                          })}
                          placeholder="25"
                          className="h-12"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label
                            htmlFor="wasteBuffer"
                            className="flex items-center gap-2"
                          >
                            {t("recipes.fields.wasteBuffer")}
                            <FieldHelp
                              helpText={t("recipes.help.wasteBuffer")}
                            />
                          </Label>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {t("recipes.placeholders.yield")}%
                          </span>
                        </div>
                        <Input
                          type="number"
                          id="wasteBuffer"
                          {...register("wasteBufferPercentage", {
                            valueAsNumber: true,
                          })}
                          placeholder="0"
                          className="h-12"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-background border border-border/50 rounded-xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t("recipes.subtotal")}:
                      </span>
                      <span className="font-semibold">
                        {getCurrencySymbol(watch("currency") || "USD")}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>

                    {watchedWasteBuffer > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">
                          {t("recipes.fields.wasteBuffer")
                            .replace("%", "")
                            .trim()}{" "}
                          ({watchedWasteBuffer}%):
                        </span>
                        <span className="font-semibold text-orange-600">
                          +{getCurrencySymbol(watch("currency") || "USD")}
                          {wasteCost.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-border/50 my-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-bold">
                        {t("recipes.trueCost")}:
                      </span>
                      <span className="font-bold text-2xl">
                        {getCurrencySymbol(watch("currency") || "USD")}
                        {totalCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-semibold">
                        {t("recipes.suggestedPrice")} ({watchedTargetCost}%{" "}
                        {t("recipes.cost")}):
                      </span>
                      <span className="font-bold text-xl text-primary">
                        {getCurrencySymbol(watch("currency") || "USD")}
                        {Number.isFinite(suggestedPrice)
                          ? suggestedPrice.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                        <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          {watchedSellingPrice
                            ? t("recipes.actualCost")
                            : t("recipes.targetCost")}
                        </span>
                        <span
                          className={`text-lg font-bold ${getMarginColor(
                            100 - currentFoodCost,
                          )}`}
                        >
                          {currentFoodCost.toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                        <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          {watchedSellingPrice
                            ? t("recipes.netMargin")
                            : t("recipes.targetMargin")}
                        </span>
                        <span
                          className={`text-lg font-bold ${getMarginColor(
                            currentMargin,
                          )}`}
                        >
                          {currentMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>

      <MobileFormFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          type="button"
          className="flex-1 sm:flex-none h-12 sm:h-9 text-lg sm:text-sm max-sm:font-bold"
        >
          {t("common.actions.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 sm:flex-none h-12 sm:h-9 text-lg sm:text-sm max-sm:font-bold"
        >
          {initialData?.name ? "Update Recipe" : "Save Recipe"}
        </Button>
      </MobileFormFooter>
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
