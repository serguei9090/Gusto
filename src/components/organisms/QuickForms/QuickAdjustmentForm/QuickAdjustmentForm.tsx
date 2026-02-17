import { ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { WasteQuantityAdjuster } from "@/components/molecules/WasteQuantityAdjuster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { inventoryRepository } from "@/modules/core/inventory/services/inventory.repository";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";

interface QuickAdjustmentFormProps {
  item: Ingredient | Asset;
  itemType: "ingredient" | "asset";
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuickAdjustmentForm = ({
  item,
  itemType,
  onSuccess,
}: QuickAdjustmentFormProps) => {
  const [actualCount, setActualCount] = useState<number>(item.currentStock);
  const [reference, setReference] = useState<string>(`COUNT-${Date.now()}`);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update reference if needed, but usually we want it stable once opened
  // or auto-generated. Let's keep one auto-generated on mount.

  const variance = actualCount - item.currentStock;
  const isVariance = Math.abs(variance) > 0.001;
  const costPerUnit = item.pricePerUnit || 0;
  const valueImpact = variance * costPerUnit;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const delta = actualCount - item.currentStock;

      if (delta === 0) {
        toast.info("No stock change detected.");
        onSuccess();
        return;
      }

      await inventoryRepository.logTransaction({
        ingredientId: itemType === "ingredient" ? item.id : undefined,
        assetId: itemType === "asset" ? item.id : undefined,
        itemType,
        transactionType: "adjustment",
        quantity: Math.abs(delta),
        costPerUnit: costPerUnit,
        totalCost: costPerUnit * Math.abs(delta),
        notes: notes
          ? `${notes} (Was ${item.currentStock}, Now ${actualCount})`
          : `Stock Count: Was ${item.currentStock}, Now ${actualCount}`,
        reference: reference || `COUNT-${Date.now()}`,
      });

      toast.success(`Updated stock to ${actualCount} ${item.unitOfMeasure}`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock");
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
            <h3 className="font-bold text-lg text-orange-700">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              Expected: {item.currentStock} {item.unitOfMeasure}
            </p>
          </div>
        </div>

        {/* Count Input */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-orange-600">
            Actual Count ({item.unitOfMeasure})
          </h4>
          <WasteQuantityAdjuster
            value={actualCount}
            onChange={setActualCount}
            unit={item.unitOfMeasure}
          />
        </div>

        {/* Variance Display */}
        {isVariance && (
          <div
            className={`p-4 rounded-lg border flex flex-col gap-2 ${
              variance < 0
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Variance:</span>
                <span
                  className={`text-lg font-bold ${variance < 0 ? "text-red-700" : "text-green-700"}`}
                >
                  {variance > 0 ? "+" : ""}
                  {variance.toFixed(2)} {item.unitOfMeasure}
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
            </div>

            {/* Value Impact */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">
                Value Impact:
              </span>
              <span
                className={`font-bold ${variance < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {valueImpact > 0 ? "+" : ""}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(valueImpact)}
              </span>
            </div>
          </div>
        )}

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
              placeholder="Reason for variance (optional)"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      <SheetFooter className="p-6 border-t mt-auto bg-background">
        <Button
          size="lg"
          className="w-full text-lg h-12 bg-orange-600 hover:bg-orange-700"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Updating..." : "Confirm Count"}
        </Button>
      </SheetFooter>
    </div>
  );
};
