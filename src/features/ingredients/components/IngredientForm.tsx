import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getCurrencyName,
  getCurrencySymbol,
  SUPPORTED_CURRENCIES,
} from "@/utils/currency";
import {
  createIngredientSchema,
  ingredientCategorySchema,
  unitOfMeasureSchema,
} from "@/utils/validators";
import type { CreateIngredientInput } from "../types";

// Infer directly from schema to ensure match
type FormSchema = z.infer<typeof createIngredientSchema>;

interface IngredientFormProps {
  defaultValues?: Partial<CreateIngredientInput>;
  onSubmit: (data: CreateIngredientInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CURRENCIES = Array.from(SUPPORTED_CURRENCIES);

export const IngredientForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: IngredientFormProps) => {
  const { t } = useTranslation();
  const { suppliers, fetchSuppliers } = useSuppliersStore();

  const form = useForm<FormSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: Hook Form resolver type mismatch with strict Zod schemas is a known limitation
    resolver: zodResolver(createIngredientSchema) as any,
    defaultValues: {
      name: "",
      currentStock: 0,
      minStockLevel: 0,
      currentPrice: 0,
      pricePerUnit: 0,
      currency: "USD",
      notes: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (suppliers.length === 0) fetchSuppliers();
  }, [suppliers.length, fetchSuppliers]);

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
              <FormLabel>
                {t("common.labels.name")}{" "}
                <span className="text-destructive">*</span>
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
                <FormLabel>
                  {t("common.labels.category")}{" "}
                  <span className="text-destructive">*</span>
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
                    {ingredientCategorySchema.options.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`common.categories.${category}`)}
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
                <FormLabel>
                  {t("ingredients.fields.unitOfMeasure")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("ingredients.fields.unitOfMeasure")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unitOfMeasureSchema.options.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("ingredients.fields.currentPrice")}{" "}
                  <span className="text-destructive">*</span>
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

          <FormField
            control={form.control}
            name="pricePerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("ingredients.fields.pricePerUnit")}{" "}
                  <span className="text-destructive">*</span>
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

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.labels.currency")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.labels.currency")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {getCurrencySymbol(curr)} - {getCurrencyName(curr)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <FormLabel>{t("ingredients.fields.currentStock")}</FormLabel>
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

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("ingredients.fields.minStockLevel")}</FormLabel>
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
          <Label htmlFor="supplierId">{t("ingredients.fields.supplier")}</Label>
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
