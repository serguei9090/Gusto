import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { MobileFormFooter } from "@/components/ui/mobile-form-footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { CurrencySelector } from "@/modules/core/settings/components/CurrencySelector";
import { useConfigStore } from "@/modules/core/settings/store/config.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";
import { useSuppliersStore } from "@/modules/core/suppliers/store/suppliers.store";
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
      category: defaultValues?.category || "",
      unitOfMeasure: defaultValues?.unitOfMeasure || "",
      currentStock: 0,
      minStockLevel: 0,
      currency: "USD",
      notes: "",
      purchaseUnit: "",
      conversionRatio: 1,
      ...defaultValues,
      // Force 2 decimal places for display to avoid high-precision values from DB
      currentPrice:
        defaultValues?.currentPrice === undefined
          ? 0
          : Number(defaultValues.currentPrice.toFixed(2)),
      pricePerUnit:
        defaultValues?.pricePerUnit === undefined
          ? 0
          : Number(defaultValues.pricePerUnit.toFixed(2)),
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
      <form onSubmit={submitHandler} className="space-y-4 pb-0">
        {/* Name - Mandatory */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {t("common.labels.name")}
                <span className="text-destructive">*</span>
                <FieldHelp helpText={t("ingredients.help.name")} />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("ingredients.placeholders.ingredientName")}
                  {...field}
                  value={field.value || ""}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit of Measure - Mandatory */}
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
                  className="h-12"
                  filterType="ingredient"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing Section */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label className="text-base font-semibold">
              Pricing Configuration
            </Label>
            <Tabs
              value={pricingMode}
              onValueChange={(v) => setPricingMode(v as "unit" | "package")}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2 md:w-[200px]">
                <TabsTrigger value="unit">Per Unit</TabsTrigger>
                <TabsTrigger value="package">By Package</TabsTrigger>
              </TabsList>
            </Tabs>
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
                      <span className="text-destructive">*</span>
                      <FieldHelp helpText="How many base units are in this package?" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        value={
                          field.value === null ||
                          field.value === undefined ||
                          Number.isNaN(field.value)
                            ? ""
                            : field.value
                        }
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                        step="0.001"
                        placeholder="1"
                        {...field}
                        value={
                          field.value === null ||
                          field.value === undefined ||
                          Number.isNaN(field.value)
                            ? ""
                            : field.value
                        }
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                      <FieldHelp
                        helpText={t("ingredients.help.pricePerUnit")}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={
                          field.value === null ||
                          field.value === undefined ||
                          Number.isNaN(field.value)
                            ? ""
                            : field.value
                        }
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber);
                          // In unit mode, currentPrice is same as pricePerUnit
                          form.setValue("currentPrice", e.target.valueAsNumber);
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

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplierId" className="flex items-center gap-2">
            {t("ingredients.fields.supplier")}
            <FieldHelp helpText={t("ingredients.help.supplier")} />
          </Label>
          <select
            id="supplierId"
            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* SECONDARY SECTION - Collapsible Additional Information */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional-info" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-base font-semibold">
                Additional Information
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-6">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {t("common.labels.category")}
                      <FieldHelp helpText={t("ingredients.help.category")} />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("common.labels.category")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {t(`common.categories.${category}`) ===
                            `common.categories.${category}`
                              ? category.charAt(0).toUpperCase() +
                                category.slice(1)
                              : t(`common.categories.${category}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
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

              {/* Stock Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {t("ingredients.fields.currentStock")}
                        <FieldHelp
                          helpText={t("ingredients.help.currentStock")}
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={isEdit}
                          value={field.value === 0 ? "" : field.value}
                          onFocus={(e) => e.target.select()}
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
                        <FieldHelp
                          helpText={t("ingredients.help.minStockLevel")}
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value === 0 ? "" : (field.value ?? "")}
                          onFocus={(e) => e.target.select()}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <MobileFormFooter>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              {t("common.actions.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-none h-12 sm:h-9"
          >
            {isLoading ? t("common.messages.saving") : t("common.actions.save")}
          </Button>
        </MobileFormFooter>
      </form>
    </Form>
  );
};
