import { Info } from "lucide-react";
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

interface QuickUsageFormProps {
  item: Ingredient | Asset;
  itemType: "ingredient" | "asset";
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuickUsageForm = ({
  item,
  itemType,
  onSuccess,
}: QuickUsageFormProps) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [reference, setReference] = useState<string>(`USAGE-${Date.now()}`);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (quantity <= 0) return;

    try {
      setIsSubmitting(true);
      const cost = item.pricePerUnit || 0;

      await inventoryRepository.logTransaction({
        ingredientId: itemType === "ingredient" ? item.id : undefined,
        assetId: itemType === "asset" ? item.id : undefined,
        itemType,
        transactionType: "usage",
        quantity,
        costPerUnit: cost,
        totalCost: cost * quantity,
        notes: notes || "Quick Usage",
        reference: reference || `USAGE-${Date.now()}`,
      });

      toast.success(`Logged usage: ${quantity} ${item.unitOfMeasure}`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log usage");
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
            <h3 className="font-bold text-lg text-blue-700">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              Current: {item.currentStock} {item.unitOfMeasure}
            </p>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-blue-600">
            Quantity Used ({item.unitOfMeasure})
          </h4>
          <WasteQuantityAdjuster
            value={quantity}
            onChange={setQuantity}
            unit={item.unitOfMeasure}
          />
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
              placeholder="Usage details (optional)"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      <SheetFooter className="p-6 border-t mt-auto bg-background">
        <Button
          size="lg"
          className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700"
          disabled={quantity <= 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Logging..." : "Confirm Usage"}
        </Button>
      </SheetFooter>
    </div>
  );
};
