import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type Resolver, type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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
import { useTranslation } from "@/hooks/useTranslation";
import { UnitSelect } from "@/modules/core/ingredients/components/UnitSelect";
import { CurrencySelector } from "@/modules/core/settings/components/CurrencySelector";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";
import { useSuppliersStore } from "@/modules/core/suppliers/store/suppliers.store";
import type { CreateAssetInput } from "@/types/asset.types";
import { createAssetSchema } from "@/utils/validators";

// Infer directly from schema to ensure match
type FormSchema = z.infer<typeof createAssetSchema>;

interface AssetFormProps {
  defaultValues?: Partial<CreateAssetInput>;
  onSubmit: (data: CreateAssetInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const AssetForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}: AssetFormProps) => {
  const { t } = useTranslation();
  const { suppliers, fetchSuppliers } = useSuppliersStore();
  const { initialize: initializeCurrency } = useCurrencyStore();

  const form = useForm<FormSchema>({
    resolver: zodResolver(createAssetSchema) as Resolver<FormSchema>,
    defaultValues: {
      name: "",
      category: "",
      unitOfMeasure: "unit",
      currentStock: 0,
      minStockLevel: 0,
      currency: "USD",
      notes: "",
      assetType: "operational",
      purchaseUnit: "",
      conversionRatio: 1,
      ...defaultValues,
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

  useEffect(() => {
    if (suppliers.length === 0) fetchSuppliers();
    initializeCurrency();
  }, [suppliers.length, fetchSuppliers, initializeCurrency]);

  const submitHandler = form.handleSubmit((data) => {
    onSubmit(data as unknown as CreateAssetInput);
  });

  return (
    <Form {...(form as unknown as UseFormReturn<FormSchema>)}>
      <form onSubmit={submitHandler} className="space-y-4 pb-0">
        {/* Name - Mandatory */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Asset Name
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Napkins, Forks, Plates"
                  {...field}
                  value={field.value || ""}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Asset Type - Mandatory */}
        <FormField
          control={form.control}
          name="assetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Asset Type {form.getValues("assetType")}
                <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="disposable">Disposable</SelectItem>
                </SelectContent>
              </Select>
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
              </FormLabel>
              <FormControl>
                <UnitSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t("ingredients.fields.unitOfMeasure")}
                  className="h-12"
                  filterType="asset"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing Section */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-semibold">Pricing</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Cost Per Unit
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        field.onChange(
                          e.target.value === ""
                            ? 0
                            : Number.parseFloat(e.target.value),
                        );
                        // For assets, let's keep it simple: pricePerUnit = currentPrice for now
                        form.setValue("currentPrice", Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplierId" className="flex items-center gap-2">
            {t("ingredients.fields.supplier")}
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

        {/* SECONDARY SECTION */}
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
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Kitchen, FOH, Cleaning"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
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

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
