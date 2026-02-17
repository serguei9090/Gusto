import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";

interface Props {
  recipeName: string;
  unitPrice: number;
  quantity: number;
  onUpdate: (data: { unitPrice?: number; quantity?: number }) => void;
  onRemove: () => void;
}

export function SalesEntryRow({
  recipeName,
  unitPrice,
  quantity,
  onUpdate,
  onRemove,
}: Props) {
  const total = unitPrice * quantity;

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-muted/50 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base">{recipeName}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Unit Price
          </span>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) =>
                onUpdate({ unitPrice: parseFloat(e.target.value) || 0 })
              }
              className="pl-7 h-10 text-sm focus-visible:ring-primary"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Quantity
          </span>
          <Input
            type="number"
            value={quantity}
            onChange={(e) =>
              onUpdate({ quantity: parseFloat(e.target.value) || 0 })
            }
            className="h-10 text-sm focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-1 border-t border-muted/30 pt-2">
        <span className="text-xs text-muted-foreground">Subtotal</span>
        <span className="font-bold text-primary">
          <CurrencyDisplay amount={total} />
        </span>
      </div>
    </div>
  );
}
