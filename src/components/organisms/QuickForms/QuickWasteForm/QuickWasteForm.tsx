import { AlertTriangle, Trash2, UtensilsCrossed, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { WasteReasonButton } from "@/components/atoms/WasteReasonButton";
import { WasteQuantityAdjuster } from "@/components/molecules/WasteQuantityAdjuster";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { inventoryRepository } from "@/modules/core/inventory/services/inventory.repository";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";

interface QuickWasteFormProps {
  item: Ingredient | Asset;
  itemType: "ingredient" | "asset";
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuickWasteForm = ({
  item,
  itemType,
  onSuccess,
}: QuickWasteFormProps) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { id: "Spoilage", icon: <XCircle className="h-6 w-6" /> },
    { id: "Dropped", icon: <UtensilsCrossed className="h-6 w-6" /> },
    { id: "Trim", icon: <AlertTriangle className="h-6 w-6" /> },
    { id: "Expired", icon: <Trash2 className="h-6 w-6" /> },
  ];

  const handleSubmit = async () => {
    if (quantity <= 0 || !reason) return;

    try {
      setIsSubmitting(true);
      const cost = item.pricePerUnit || 0;

      await inventoryRepository.logTransaction({
        ingredientId: itemType === "ingredient" ? item.id : undefined,
        assetId: itemType === "asset" ? item.id : undefined,
        itemType,
        transactionType: "waste",
        quantity,
        costPerUnit: cost,
        totalCost: cost * quantity,
        notes: `Quick Waste: ${reason}`,
        reference: `WASTE-${Date.now()}`,
      });

      toast.success(`Logged waste: ${quantity} ${item.unitOfMeasure}`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log waste");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-8 animate-in slide-in-from-right-10 fade-in duration-300">
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
          <div>
            <h3 className="font-bold text-lg text-red-700">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              Current: {item.currentStock} {item.unitOfMeasure}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-red-600">
            Quantity Wasted ({item.unitOfMeasure})
          </h4>
          <WasteQuantityAdjuster
            value={quantity}
            onChange={setQuantity}
            unit={item.unitOfMeasure}
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-red-600">
            Reason
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {reasons.map((r) => (
              <WasteReasonButton
                key={r.id}
                reason={r.id}
                icon={r.icon}
                selected={reason === r.id}
                onClick={() => setReason(r.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <SheetFooter className="p-6 border-t mt-auto bg-background">
        <Button
          size="lg"
          className="w-full text-lg h-12 bg-red-600 hover:bg-red-700"
          disabled={quantity <= 0 || !reason || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Logging..." : "Confirm Waste"}
        </Button>
      </SheetFooter>
    </div>
  );
};
