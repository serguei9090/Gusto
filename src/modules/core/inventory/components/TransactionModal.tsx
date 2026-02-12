import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { Slot } from "@/lib/slots/Slot";
import type {
  Ingredient,
  TransactionType,
} from "@/modules/core/inventory/types";
import { CurrencySelector } from "@/modules/core/settings/components/CurrencySelector";
import type { Currency } from "@/utils/currency";
import { createTransactionSchema } from "@/utils/validators";

interface TransactionModalProps {
  ingredient: Ingredient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Form data type
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function TransactionModal({
  ingredient,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: TransactionModalProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      ingredientId: ingredient.id,
      transactionType: "purchase" as TransactionType,
      quantity: 0,
      costPerUnit: ingredient.pricePerUnit
        ? Number(ingredient.pricePerUnit.toFixed(2))
        : 0,
      totalCost: 0,
      currency: ingredient.currency || "USD",
      reference: "",
      notes: "",
    },
  });

  const [isUsingPurchaseUnit, setIsUsingPurchaseUnit] = useState(false);

  // Reset form when ingredient changes or modal opens
  useEffect(() => {
    if (open) {
      setIsUsingPurchaseUnit(false);
      reset({
        ingredientId: ingredient.id,
        transactionType: "purchase" as TransactionType,
        quantity: 0,
        costPerUnit: ingredient.pricePerUnit
          ? Number(ingredient.pricePerUnit.toFixed(2))
          : 0,
        totalCost: 0,
        currency: ingredient.currency || "USD",
        reference: "",
        notes: "",
      });
    }
  }, [open, ingredient, reset]);

  const handleTransact = handleSubmit(async (data) => {
    let finalQuantity = data.quantity || 0;
    let finalCostPerUnit = data.costPerUnit || 0;
    let finalNotes = data.notes;

    if (isUsingPurchaseUnit && ingredient.conversionRatio) {
      finalQuantity = (data.quantity || 0) * ingredient.conversionRatio;
      finalCostPerUnit = (data.costPerUnit || 0) / ingredient.conversionRatio;
      const notePrefix = `Bulk Purchase: ${data.quantity} x ${ingredient.purchaseUnit}`;
      finalNotes = finalNotes ? `${notePrefix} | ${finalNotes}` : notePrefix;
    }

    await onSubmit({
      ...data,
      quantity: finalQuantity,
      costPerUnit: finalCostPerUnit,
      notes: finalNotes,
    });
  });

  const watchedQty = watch("quantity") || 0;
  const watchedPrice = watch("costPerUnit") || 0;
  const totalCost = watchedQty * watchedPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-[425px] sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg border-x-0 sm:border p-4 pt-6 max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Stock: {ingredient.name}</DialogTitle>
          <DialogDescription>Record a stock transaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleTransact} className="space-y-4 pb-20 sm:pb-0">
          <div className="grid gap-4 py-2">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label
                htmlFor="transactionType"
                className="flex items-center gap-2"
              >
                Transaction Type <span className="text-destructive">*</span>
                <FieldHelp helpText={t("inventory.help.transactionType")} />
              </Label>
              <Select
                onValueChange={(val) =>
                  setValue("transactionType", val as TransactionType)
                }
                defaultValue="purchase"
              >
                <SelectTrigger className="h-12 sm:h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-700 p-1 rounded-full">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                      <span>Purchase (Add to Stock)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="usage">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 text-red-700 p-1 rounded-full">
                        <ArrowDownLeft className="h-4 w-4" />
                      </div>
                      <span>Usage (Subtract from Stock)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="waste">
                    <div className="flex items-center gap-2">
                      <div className="bg-destructive/10 text-destructive p-1 rounded-full">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <span>Waste (Subtract from Stock)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="adjustment">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 p-1 rounded-full">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span>Stock Count (Set Current Stock)</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Overwrites current stock with new value
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.transactionType && (
                <p className="text-sm text-destructive">
                  {errors.transactionType.message as string}
                </p>
              )}
            </div>

            {/* Unit Selection (Base vs Purchase) */}
            {ingredient.purchaseUnit &&
              (ingredient.conversionRatio || 0) > 1 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Unit for this Transaction
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={isUsingPurchaseUnit ? "outline" : "default"}
                      className="flex-1 h-10"
                      onClick={() => setIsUsingPurchaseUnit(false)}
                    >
                      {ingredient.unitOfMeasure} (Base)
                    </Button>
                    <Button
                      type="button"
                      variant={isUsingPurchaseUnit ? "default" : "outline"}
                      className="flex-1 h-10"
                      onClick={() => setIsUsingPurchaseUnit(true)}
                    >
                      {ingredient.purchaseUnit} (Case/Pack)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 {ingredient.purchaseUnit} = {ingredient.conversionRatio}{" "}
                    {ingredient.unitOfMeasure}
                  </p>
                </div>
              )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                Quantity (
                {isUsingPurchaseUnit
                  ? ingredient.purchaseUnit
                  : ingredient.unitOfMeasure}
                ) <span className="text-destructive">*</span>
                <FieldHelp helpText={t("inventory.help.quantity")} />
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                {...register("quantity", { valueAsNumber: true })}
                className="h-12 sm:h-10"
                onFocus={(e) => e.target.select()}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">
                  {errors.quantity.message as string}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="costPerUnit"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                Price per{" "}
                {isUsingPurchaseUnit
                  ? ingredient.purchaseUnit
                  : ingredient.unitOfMeasure || "Unit"}{" "}
                ($)
                <FieldHelp helpText={t("inventory.help.costPerUnit")} />
              </Label>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                {...register("costPerUnit", { valueAsNumber: true })}
                className="h-12 sm:h-10"
                onFocus={(e) => e.target.select()}
              />
              {isUsingPurchaseUnit && ingredient.conversionRatio && (
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Calculates to: $
                  {(watchedPrice / ingredient.conversionRatio).toFixed(2)} /{" "}
                  {ingredient.unitOfMeasure}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                Currency
                <FieldHelp helpText={t("inventory.help.currency")} />
              </Label>
              <CurrencySelector
                value={(watch("currency") as Currency) || "USD"}
                onChange={(val) => setValue("currency", val as Currency)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total Transaction Cost
                </Label>
                <div className="text-lg font-mono font-bold">
                  ${totalCost.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1 text-right border-l pl-2 border-border/50">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Effect on Stock
                </Label>
                <div className="text-lg font-mono font-bold">
                  {watch("transactionType") === "adjustment" ? "" : "+"}
                  {isUsingPurchaseUnit && ingredient.conversionRatio
                    ? Number(
                        (watchedQty * ingredient.conversionRatio).toFixed(2),
                      )
                    : Number(watchedQty.toFixed(2))}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {ingredient.unitOfMeasure}
                  </span>
                </div>
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference" className="flex items-center gap-2">
                Reference / Invoice #
                <FieldHelp helpText={t("inventory.help.reference")} />
              </Label>
              <Input
                id="reference"
                placeholder="e.g. INV-12345"
                {...register("reference")}
                className="h-12 sm:h-10"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                Notes
                <FieldHelp helpText={t("inventory.help.notes")} />
              </Label>
              <Textarea
                id="notes"
                placeholder="Reason for adjustment..."
                {...register("notes")}
              />
            </div>
          </div>

          <MobileFormFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              {isLoading ? "Saving..." : "Save Transaction"}
            </Button>
            <Slot name="transaction-modal:footer" />
          </MobileFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
