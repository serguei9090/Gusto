import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrencyAmount } from "@/utils/currencyConverter";
import type { Ingredient } from "../types";

interface IngredientTableProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
}

export const IngredientTable = ({
  ingredients,
  onEdit,
  onDelete,
}: IngredientTableProps) => {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg bg-card">
        <p>No ingredients found.</p>
        <p className="text-sm">Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 [&_tr]:border-b">
          <tr>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Name
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Category
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Price / Batch
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Price / Unit
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
              Stock
            </th>
            <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground w-[100px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {ingredients.map((ing) => (
            <tr
              key={ing.id}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-4 align-middle font-medium">{ing.name}</td>
              <td className="p-4 align-middle">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 capitalize",
                  )}
                >
                  {ing.category}
                </span>
              </td>
              <td className="p-4 align-middle">
                {formatCurrencyAmount(ing.currentPrice, ing.currency || "USD")}
              </td>
              <td className="p-4 align-middle">
                {formatCurrencyAmount(ing.pricePerUnit, ing.currency || "USD")}{" "}
                / {ing.unitOfMeasure}
              </td>
              <td className="p-4 align-middle">
                <span className="flex items-center gap-2">
                  {ing.currentStock} {ing.unitOfMeasure}
                  {ing.minStockLevel &&
                    ing.currentStock <= ing.minStockLevel && (
                      <span title="Low Stock">
                        <AlertTriangle size={16} className="text-destructive" />
                      </span>
                    )}
                </span>
              </td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(ing)}
                    title="Edit"
                    className="h-8 w-8"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(ing.id)}
                    title="Delete"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
