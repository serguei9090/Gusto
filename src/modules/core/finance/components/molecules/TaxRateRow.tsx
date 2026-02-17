import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { TaxRate } from "../../types";
import { TaxBadge } from "../atoms/TaxBadge";

interface TaxRateRowProps {
  tax: TaxRate;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, active: boolean) => void;
}

export function TaxRateRow({
  tax,
  onEdit,
  onDelete,
  onToggle,
}: TaxRateRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Switch
          checked={tax.isActive}
          onCheckedChange={(checked) => onToggle(tax.id, checked)}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{tax.name}</span>
            <TaxBadge type={tax.type} />
          </div>
          <p className="text-sm text-muted-foreground">
            {(tax.rate * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(tax.id)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(tax.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
