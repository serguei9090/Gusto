import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldHelp } from "@/components/ui/field-help";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySelector } from "@/features/settings/components/CurrencySelector";
import { useConfigStore } from "@/features/settings/store/config.store";
import { useCurrencyStore } from "@/features/settings/store/currency.store";
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import { useTranslation } from "@/hooks/useTranslation";
import { createIngredientSchema } from "@/utils/validators";
import type { CreateIngredientInput } from "../types";
import { UnitSelect } from "./UnitSelect";

// Infer directly from schema to ensure match
type FormSchema = z.infer<typeof createIngredientSchema>;

interface IngredientFormProps {
  defaultValues?: Partial<CreateIngredientInput>;
  onSubmit: (data: CreateIngredientInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const IngredientForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}: IngredientFormProps) => {
  const { t } = useTranslation();
  const { suppliers, fetchSuppliers } = useSuppliersStore();
  const { initialize: initializeCurrency } = useCurrencyStore();
  const { getIngredientCategories } = useConfigStore();
  const categories = getIngredientCategories();

  const form = useForm<FormSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: Hook Form resolver type mismatch with strict Zod schemas is a known limitation
    resolver: zodResolver(createIngredientSchema) as any,
    defaultValues: {
      name: "",
      currentStock: 0,
      minStockLevel: 0,
      currency: "USD",
      notes: "",
      purchaseUnit: "",
      conversionRatio: 1,
      ...defaultValues,
      // Force 2 decimal places for display to avoid high-precision values from DB
      currentPrice:
        defaultValues?.currentPrice !== undefined
          ? Number(defaultValues.currentPrice.toFixed(2))
          : (defaultValues?.currentPrice ?? 0),
      pricePerUnit:
        defaultValues?.pricePerUnit !== undefined
          ? Number(defaultValues.pricePerUnit.toFixed(2))
          : (defaultValues?.pricePerUnit ?? 0),
    },
  });

  // State for Pricing Mode: "unit" or "package"
  const [pricingMode, setPricingMode] = useState<"unit" | "package">(
    defaultValues?.purchaseUnit ? "package" : "unit",
  );

  // Auto-calculate Price Per Unit when in Package Mode
  const currentPrice = form.watch("currentPrice");
  const conversionRatio = form.watch("conversionRatio");

  useEffect(() => {
    if (pricingMode === "package") {
      const price = Number(currentPrice) || 0;
      const ratio = Number(conversionRatio) || 1;
      if (ratio > 0) {
        const calculated = price / ratio;
        // Avoid infinite loop if value is same
        if (Math.abs(form.getValues("pricePerUnit") - calculated) > 0.001) {
          form.setValue("pricePerUnit", Number(calculated.toFixed(2)));
        }
      }
    }
  }, [currentPrice, conversionRatio, pricingMode, form]);

  // Reset Purchase Unit fields when switching to Unit Mode
  useEffect(() => {
    if (pricingMode === "unit") {
      const currentVal = form.getValues("conversionRatio");
      if (currentVal !== 1) {
        form.setValue("conversionRatio", 1);
        form.setValue("purchaseUnit", "");
      }
    }
  }, [pricingMode, form]);

  useEffect(() => {
    if (suppliers.length === 0) fetchSuppliers();
    initializeCurrency();
  }, [suppliers.length, fetchSuppliers, initializeCurrency]);

  const submitHandler = form.handleSubmit((data) => {
    onSubmit(data as CreateIngredientInput);
  });

  return (
    <Form {...form}>
      <form
        onSubmit={submitHandler}
        className="space-y-6 max-w-2xl mx-auto p-1"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {t("common.labels.name")}{" "}
                <span className="text-destructive">*</span>
                <FieldHelp helpText={t("ingredients.help.name")} />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("ingredients.placeholders.ingredientName")}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {t("common.labels.category")}{" "}
                  <span className="text-destructive">*</span>
                  <FieldHelp helpText={t("ingredients.help.category")} />
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.labels.category")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`common.categories.${category}`) !==
                        `common.categories.${category}`
                          ? t(`common.categories.${category}`)
                          : category.charAt(0).toUpperCase() +
                            category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitOfMeasure"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {t("ingredients.fields.unitOfMeasure")}{" "}
                  <span className="text-destructive">*</span>
                  <FieldHelp helpText={t("ingredients.help.unitOfMeasure")} />
                </FormLabel>
                <FormControl>
                  <UnitSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t("ingredients.fields.unitOfMeasure")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              Pricing Configuration
            </Label>
            <div className="flex bg-muted p-1 rounded-md">
              <Button
                type="button"
                variant={pricingMode === "unit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPricingMode("unit")}
                className="text-xs px-3 h-7"
              >
                Per Base Unit
              </Button>
              <Button
                type="button"
                variant={pricingMode === "package" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPricingMode("package")}
                className="text-xs px-3 h-7"
              >
                By Package / Bulk
              </Button>
            </div>
          </div>

          {pricingMode === "package" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md border border-border/50">
              <FormField
                control={form.control}
                name="purchaseUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Package Name
                      {/* {t("ingredients.fields.purchaseUnit")} */}
                      <span className="text-destructive">*</span>
                      <FieldHelp helpText="e.g. Box, Case, Bag" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Case of 12"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conversionRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Items per Package
                      {/* {t("ingredients.fields.conversionRatio")} */}
                      <span className="text-destructive">*</span>
                      <FieldHelp helpText="How many base units are in this package?" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : Number.parseFloat(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Package Cost
                      <span className="text-destructive">*</span>
                      <FieldHelp helpText="Total cost of the package" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : Number.parseFloat(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-center space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Calculated Price Per Unit
                </Label>
                <div className="text-lg font-mono font-bold">
                  ${form.watch("pricePerUnit")?.toFixed(2) || "0.00"} /{" "}
                  {form.watch("unitOfMeasure") || "unit"}
                </div>
              </div>
            </div>
          )}

          {pricingMode === "unit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {t("ingredients.fields.pricePerUnit")}{" "}
                      <span className="text-destructive">*</span>
                      <FieldHelp
                        helpText={t("ingredients.help.pricePerUnit")}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : Number.parseFloat(e.target.value),
                          );
                          // In unit mode, currentPrice is same as pricePerUnit
                          form.setValue("currentPrice", Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {t("common.labels.currency")}
                <FieldHelp helpText={t("ingredients.help.currency")} />
              </FormLabel>
              <FormControl>
                <CurrencySelector
                  value={field.value ?? "USD"}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {t("ingredients.fields.currentStock")}
                  <FieldHelp helpText={t("ingredients.help.currentStock")} />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    disabled={isEdit}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? 0
                          : Number.parseFloat(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {t("ingredients.fields.minStockLevel")}
                  <FieldHelp helpText={t("ingredients.help.minStockLevel")} />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? 0
                          : Number.parseFloat(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierId" className="flex items-center gap-2">
            {t("ingredients.fields.supplier")}
            <FieldHelp helpText={t("ingredients.help.supplier")} />
          </Label>
          <select
            id="supplierId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("supplierId", {
              setValueAs: (v) => (v === "" ? null : Number.parseInt(v, 10)),
            })}
          >
            <option value="">{t("common.messages.noData")}</option>
            {suppliers.map((s) => (
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
            {isLoading ? t("common.messages.saving") : t("common.actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
