import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useIngredientsStore } from "@/features/ingredients/store/ingredients.store";
import { CurrencySelector } from "@/features/settings/components/CurrencySelector";
import { useCurrencyStore } from "@/features/settings/store/currency.store";
import { useTranslation } from "@/hooks/useTranslation";
import {
  calculateFoodCostPercentage,
  calculateIngredientCost,
  calculateProfitMargin,
  calculateRecipeTotal,
  calculateSuggestedPrice,
} from "@/utils/costEngine";
import { type Currency, getCurrencySymbol } from "@/utils/currency";

import {
  recipeCategorySchema,
  recipeFormSchema,
  unitOfMeasureSchema,
} from "@/utils/validators";

export type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => Promise<void>;
  initialData?: Partial<RecipeFormData>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RecipeForm = ({
  onSubmit,
  initialData,
  onCancel,
  isLoading,
}: RecipeFormProps) => {
  const { t } = useTranslation();
  const { ingredients: allIngredients, fetchIngredients } =
    useIngredientsStore();
  const { initialize: initializeCurrency } = useCurrencyStore();

  // Load ingredients and currencies if empty
  useEffect(() => {
    if (allIngredients.length === 0) fetchIngredients();
    initializeCurrency();
  }, [allIngredients.length, fetchIngredients, initializeCurrency]);

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

  // Calculate Total Cost
  const { subtotal, wasteCost, totalCost } = calculateRecipeTotal(
    watchedIngredients.map((field) => {
      const original = allIngredients.find((i) => i.id === field.ingredientId);
      return {
        name: original?.name || "Unknown",
        quantity: field.quantity,
        unit: field.unit,
        currentPricePerUnit: field.price || original?.pricePerUnit || 0,
        ingredientUnit: field.ingredientUnit || original?.unitOfMeasure || "kg",
      };
    }),
    watchedWasteBuffer,
  );

  const suggestedPrice = calculateSuggestedPrice(totalCost, watchedTargetCost);

  // If selling price is empty, use suggested price for margin calculations
  const effectivePrice = watchedSellingPrice || suggestedPrice || 0;
  const currentMargin = calculateProfitMargin(totalCost, effectivePrice);
  const currentFoodCost = calculateFoodCostPercentage(
    totalCost,
    effectivePrice,
  );

  const handleAddIngredient = (value: string) => {
    const id = Number(value);
    if (!id) return;

    const original = allIngredients.find((i) => i.id === id);
    if (original) {
      append({
        ingredientId: original.id,
        quantity: 1,
        unit: original.unitOfMeasure,
        name: original.name,
        price: original.pricePerUnit,
        ingredientUnit: original.unitOfMeasure,
      });
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

  return (
    <form onSubmit={submitHandler} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
            <CardDescription>Basic information about the dish.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Recipe Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Beef Burger"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  {...register("category")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  {recipeCategorySchema.options.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">
                  Servings <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  id="servings"
                  {...register("servings", { valueAsNumber: true })}
                  min={1}
                />
                {errors.servings && (
                  <p className="text-sm text-destructive">
                    {errors.servings.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (mins)</Label>
              <Input
                type="number"
                id="prepTime"
                {...register("prepTimeMinutes", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief overview..."
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Financials</CardTitle>
            <CardDescription>Costing and pricing targets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">
                {t("recipes.fields.sellingPrice")}
                <span className="ml-2 text-[10px] text-muted-foreground uppercase opacity-70">
                  (Optional)
                </span>
              </Label>
              <Input
                type="number"
                step="0.01"
                id="sellingPrice"
                {...register("sellingPrice", { valueAsNumber: true })}
                placeholder={
                  suggestedPrice > 0 ? suggestedPrice.toFixed(2) : "0.00"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("common.labels.currency")}</Label>
              <CurrencySelector
                value={watch("currency") ?? "USD"}
                onChange={(value) =>
                  setValue("currency", value as "USD" | "EUR" | "CUP")
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="targetCost">Target Food Cost %</Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Default: 25%
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
                <Label htmlFor="wasteBuffer">Waste Buffer %</Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  e.g. 5%
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
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {getCurrencySymbol(watch("currency") || "USD")}
                  {subtotal.toFixed(2)}
                </span>
              </div>

              {watchedWasteBuffer > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Waste Buffer ({watchedWasteBuffer}%):
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
                  True Recipe Cost:
                </span>
                <span className="font-bold text-lg">
                  {getCurrencySymbol(watch("currency") || "USD")}
                  {totalCost.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Suggested Price ({watchedTargetCost}% Cost):
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
                    ? "Actual Food Cost:"
                    : "Target Food Cost:"}
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
                    ? "Net Profit Margin:"
                    : "Target Profit Margin:"}
                </span>
                <span className={`font-bold ${getMarginColor(currentMargin)}`}>
                  {currentMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>Components of the recipe.</CardDescription>
          </div>
          <Select onValueChange={handleAddIngredient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="+ Add Ingredient" />
            </SelectTrigger>
            <SelectContent>
              {allIngredients.map((ing) => (
                <SelectItem key={ing.id} value={ing.id.toString()}>
                  {ing.name} ({ing.unitOfMeasure})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                    Ingredient
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">
                    Qty
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[120px]">
                    Unit
                  </th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">
                    Cost
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
                      {field.name || "Loading..."}
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
                      <select
                        {...register(`ingredients.${index}.unit`)}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {unitOfMeasureSchema.options.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
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
