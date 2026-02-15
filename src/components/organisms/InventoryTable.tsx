import { AlertCircle, Edit3, History } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Ingredient } from "@/modules/core/inventory/types";
import { formatCurrencyAmount } from "@/utils/currencyConverter";

interface InventoryTableProps {
  readonly ingredients: Ingredient[];
  readonly onEdit: (ingredient: Ingredient) => void;
  readonly onViewHistory: (ingredient: Ingredient) => void;
}

export function InventoryTable({
  ingredients,
  onEdit,
  onViewHistory,
}: InventoryTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Min Level</TableHead>
            <TableHead>Avg Cost / Unit</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No ingredients found.
              </TableCell>
            </TableRow>
          ) : (
            ingredients.map((ingredient) => {
              const isLow =
                ingredient.minStockLevel !== null &&
                ingredient.currentStock <= ingredient.minStockLevel;

              return (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                  </TableCell>
                  <TableCell className="capitalize">
                    {ingredient.category}
                  </TableCell>
                  <TableCell>
                    <span
                      className={isLow ? "text-destructive font-medium" : ""}
                    >
                      {Number(ingredient.currentStock.toFixed(2))}{" "}
                      {ingredient.unitOfMeasure}
                    </span>
                  </TableCell>
                  <TableCell>
                    {ingredient.minStockLevel !== null &&
                    ingredient.minStockLevel !== undefined
                      ? `${Number(ingredient.minStockLevel.toFixed(2))} ${ingredient.unitOfMeasure}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {formatCurrencyAmount(
                      ingredient.pricePerUnit,
                      ingredient.currency || "USD",
                    )}
                    <span className="text-muted-foreground text-xs ml-1">
                      / {ingredient.unitOfMeasure}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatCurrencyAmount(
                      ingredient.currentStock * ingredient.pricePerUnit,
                      ingredient.currency || "USD",
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {isLow ? (
                        <StatusBadge
                          type="error"
                          label="Low Stock"
                          icon={AlertCircle}
                        />
                      ) : (
                        <StatusBadge type="success" label="In Stock" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ingredient)}
                      title="Edit Details"
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Edit Details</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(ingredient)}
                      title="History"
                      className="h-8 w-8 p-0"
                    >
                      <History className="h-4 w-4" />
                      <span className="sr-only">History</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
