import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { createIngredientSchema } from "@/utils/validators";
import { SUPPORTED_CURRENCIES, getCurrencySymbol, getCurrencyName } from "@/utils/currency";
import type { CreateIngredientInput } from "../types";

// Infer directly from schema to ensure match
type FormSchema = z.infer<typeof createIngredientSchema>;

interface IngredientFormProps {
  defaultValues?: Partial<CreateIngredientInput>;
  onSubmit: (data: CreateIngredientInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  "protein",
  "vegetable",
  "dairy",
  "spice",
  "grain",
  "fruit",
  "condiment",
  "other",
];
const UNITS = ["kg", "g", "l", "ml", "piece", "cup", "tbsp", "tsp"];
const CURRENCIES = Array.from(SUPPORTED_CURRENCIES);

export const IngredientForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: IngredientFormProps) => {
  const { t } = useTranslation();
  const { suppliers, fetchSuppliers } = useSuppliersStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    // @ts-expect-error zodResolver typing works but can be tricky
    resolver: zodResolver(createIngredientSchema),
    defaultValues: {
      currentStock: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (suppliers.length === 0) fetchSuppliers();
  }, [suppliers.length, fetchSuppliers]);

  const submitHandler = handleSubmit((data) => {
    onSubmit(data as unknown as CreateIngredientInput);
  });

  return (
    <form onSubmit={submitHandler} className="space-y-6 max-w-2xl mx-auto p-1">
      <div className="space-y-2">
        <Label htmlFor="name">{t("common.labels.name")}</Label>
        <Input
          id="name"
          placeholder={t("ingredients.placeholders.ingredientName")}
          {...register("name")}
          className={cn(
            errors.name && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">{t("common.labels.category")}</Label>
          <select
            id="category"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("category")}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">{t("common.labels.unit")}</Label>
          <select
            id="unit"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("unitOfMeasure")}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {errors.unitOfMeasure && (
            <p className="text-xs text-destructive">
              {errors.unitOfMeasure.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentPrice">{t("ingredients.fields.currentPrice")}</Label>
          <Input
            id="currentPrice"
            type="number"
            step="0.01"
            {...register("currentPrice", { valueAsNumber: true })}
            className={cn(
              errors.currentPrice &&
              "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.currentPrice && (
            <p className="text-xs text-destructive">
              {errors.currentPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerUnit">{t("ingredients.fields.pricePerUnit")}</Label>
          <Input
            id="pricePerUnit"
            type="number"
            step="0.01"
            {...register("pricePerUnit", { valueAsNumber: true })}
            className={cn(
              errors.pricePerUnit &&
              "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.pricePerUnit && (
            <p className="text-xs text-destructive">
              {errors.pricePerUnit.message}
            </p>
          )}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="space-y-2">
        <Label htmlFor="currency">{t("common.labels.currency")}</Label>
        <select
          id="currency"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("currency")}
        >
          {CURRENCIES.map((curr) => (
            <option key={curr} value={curr}>
              {getCurrencySymbol(curr)} - {getCurrencyName(curr)}
            </option>
          ))}
        </select>
        {errors.currency && (
          <p className="text-xs text-destructive">
            {errors.currency.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentStock">{t("ingredients.fields.currentStock")}</Label>
          <Input
            id="currentStock"
            type="number"
            step="0.01"
            {...register("currentStock", { valueAsNumber: true })}
          />
          {errors.currentStock && (
            <p className="text-xs text-destructive">
              {errors.currentStock.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">{t("ingredients.fields.minStockLevel")}</Label>
          <Input
            id="minStock"
            type="number"
            step="0.01"
            {...register("minStockLevel", { valueAsNumber: true })}
          />
          {errors.minStockLevel && (
            <p className="text-xs text-destructive">
              {errors.minStockLevel.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierId">{t("ingredients.fields.supplier")}</Label>
        <select
          id="supplierId"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("supplierId", {
            setValueAs: (v) => (v === "" ? null : Number.parseInt(v, 10)),
          })}
        >
          <option value="">{t("common.messages.noData")}</option>
          {suppliers.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("common.actions.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("common.messages.saving") : t("common.actions.save") + " " + t("ingredients.title").slice(0, -1)}
        </Button>
      </div>
    </form >
  );
};
