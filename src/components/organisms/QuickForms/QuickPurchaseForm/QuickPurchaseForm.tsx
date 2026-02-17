import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WasteQuantityAdjuster } from "@/components/molecules/WasteQuantityAdjuster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { inventoryRepository } from "@/modules/core/inventory/services/inventory.repository";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";
import { convertCurrency } from "@/utils/currencyConverter";

interface QuickPurchaseFormProps {
  item: Ingredient | Asset;
  itemType: "ingredient" | "asset";
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuickPurchaseForm = ({
  item,
  itemType,
  onSuccess,
}: QuickPurchaseFormProps) => {
  const { currencies, baseCurrency, loadCurrencies, loadExchangeRates } =
    useCurrencyStore();

  const [quantity, setQuantity] = useState<number>(0);
  // Track the currently selected currency for the input
  // Default to item currency, fallback to base, fallback to USD
  const [currency, setCurrency] = useState<string>(
    item.currency || baseCurrency || "USD",
  );

  // Unit Cost in the *current selected currency*
  // User enters THIS value in THIS currency.
  // We do NOT auto-convert this value when currency changes anymore.
  const [unitCost, setUnitCost] = useState<string>(
    item.pricePerUnit ? item.pricePerUnit.toString() : "",
  );

  const [totalCost, setTotalCost] = useState<string>("");
  const [isTotalMode, setIsTotalMode] = useState(false);
  const [reference, setReference] = useState<string>(`PURCHASE-${Date.now()}`);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseEquivalent, setBaseEquivalent] = useState<string | null>(null);
  const [conversionInfo, setConversionInfo] = useState<string | null>(null);

  // Load currencies on mount
  useEffect(() => {
    loadCurrencies();
    loadExchangeRates();
  }, [loadCurrencies, loadExchangeRates]);

  // Recalculate base equivalent whenever relevant values change
  // This is purely for display: "You are entering 100 CUP ≈ 4.00 USD"
  useEffect(() => {
    const calculateEquivalent = async () => {
      // If no cost, or matches base currency, no need to show eq
      if (!unitCost || !currency || currency === baseCurrency) {
        setBaseEquivalent(null);
        return;
      }

      const cost = parseFloat(unitCost);
      if (Number.isNaN(cost)) return;

      const result = await convertCurrency(cost, currency, baseCurrency);
      if (result.converted) {
        setBaseEquivalent(result.converted.toFixed(4));
      }
    };
    calculateEquivalent();
  }, [unitCost, currency, baseCurrency]);

  // Handle Currency Change
  const handleCurrencyChange = async (newCurrency: string) => {
    const oldCurrency = currency;
    setCurrency(newCurrency);

    // Auto-convert unit cost if present
    if (unitCost && !Number.isNaN(parseFloat(unitCost))) {
      const currentAmount = parseFloat(unitCost);
      const result = await convertCurrency(
        currentAmount,
        oldCurrency,
        newCurrency,
      );

      if (result.converted) {
        const newUnitCost = result.converted.toFixed(4);
        setUnitCost(newUnitCost);

        // Update total cost if quantity exists
        if (quantity > 0) {
          setTotalCost((parseFloat(newUnitCost) * quantity).toFixed(2));
        }

        // Set info message
        if (result.rate) {
          setConversionInfo(
            `Auto-converted from ${oldCurrency} (Rate: ${result.rate.toFixed(4)})`,
          );
          // Clear info after 5 seconds
          setTimeout(() => setConversionInfo(null), 5000);
        }
      }
    }
  };

  const handleUnitCostChange = (val: string) => {
    setUnitCost(val);
    if (quantity > 0 && val) {
      setTotalCost((parseFloat(val) * quantity).toFixed(2));
    } else {
      setTotalCost("");
    }
  };

  const handleTotalCostChange = (val: string) => {
    setTotalCost(val);
    if (quantity > 0 && val) {
      setUnitCost((parseFloat(val) / quantity).toFixed(4));
    } else {
      setUnitCost("");
    }
  };

  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    if (isTotalMode && totalCost) {
      setUnitCost(val > 0 ? (parseFloat(totalCost) / val).toFixed(4) : "");
    } else if (!isTotalMode && unitCost) {
      setTotalCost(val > 0 ? (parseFloat(unitCost) * val).toFixed(2) : "");
    }
  };

  const handleSubmit = async () => {
    if (quantity <= 0 || !unitCost) return;

    try {
      setIsSubmitting(true);
      const finalUnitCost = parseFloat(unitCost);
      const finalTotalCost = parseFloat(totalCost) || finalUnitCost * quantity;

      await inventoryRepository.logTransaction({
        ingredientId: itemType === "ingredient" ? item.id : undefined,
        assetId: itemType === "asset" ? item.id : undefined,
        itemType,
        transactionType: "purchase",
        quantity,
        costPerUnit: finalUnitCost, // Sent in SELECTED currency
        totalCost: finalTotalCost, // Sent in SELECTED currency
        currency, // Repository handles WAC conversion
        notes: notes || "Quick Purchase",
        reference: reference || `PURCHASE-${Date.now()}`,
      });

      toast.success(`Logged purchase: ${quantity} ${item.unitOfMeasure}`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 animate-in slide-in-from-right-10 fade-in duration-300">
        {/* Item Header */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
          <div>
            <h3 className="font-bold text-lg text-green-700">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              Current: {item.currentStock} {item.unitOfMeasure}
            </p>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-green-600">
            Quantity Purchased ({item.unitOfMeasure})
          </h4>
          <WasteQuantityAdjuster
            value={quantity}
            onChange={handleQuantityChange}
            unit={item.unitOfMeasure}
          />
        </div>

        {/* Cost Input Selection */}
        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Cost Input Mode</Label>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${!isTotalMode ? "font-bold" : ""}`}>
                Per Unit
              </span>
              <Switch
                checked={isTotalMode}
                onCheckedChange={setIsTotalMode}
                className="data-[state=checked]:bg-green-600"
              />
              <span className={`text-sm ${isTotalMode ? "font-bold" : ""}`}>
                Total
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit Cost</Label>
              <Input
                type="number"
                value={unitCost}
                onChange={(e) => handleUnitCostChange(e.target.value)}
                disabled={isTotalMode}
                className={
                  !isTotalMode
                    ? "border-green-500 ring-1 ring-green-500"
                    : "bg-muted"
                }
              />
              {baseEquivalent && (
                <p className="text-xs text-muted-foreground text-right">
                  ≈ {baseEquivalent} {baseCurrency}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <Input
                type="number"
                value={totalCost}
                onChange={(e) => handleTotalCostChange(e.target.value)}
                disabled={!isTotalMode}
                className={
                  isTotalMode
                    ? "border-green-500 ring-1 ring-green-500"
                    : "bg-muted"
                }
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  .filter((c) => c.isActive)
                  .map((cur) => (
                    <SelectItem key={cur.code} value={cur.code}>
                      <div className="flex items-center gap-2">
                        <span>{cur.code}</span>
                        <span className="text-muted-foreground text-xs">
                          ({cur.name})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {conversionInfo && (
              <p className="text-xs text-blue-600 font-medium animate-in fade-in slide-in-from-top-1">
                {conversionInfo}
              </p>
            )}
          </div>
        </div>

        {/* Metadata Fields */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="reference">Reference ID</Label>
            <div className="relative">
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Automatic..."
                className="pr-8"
              />
              <Info className="h-4 w-4 absolute right-3 top-3 text-muted-foreground/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice # or other notes (optional)"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      <SheetFooter className="p-6 border-t mt-auto bg-background">
        <Button
          size="lg"
          className="w-full text-lg h-12 bg-green-600 hover:bg-green-700"
          disabled={quantity <= 0 || !unitCost || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Logging..." : "Confirm Purchase"}
        </Button>
      </SheetFooter>
    </div>
  );
};
