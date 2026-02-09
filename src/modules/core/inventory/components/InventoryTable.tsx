import { AlertCircle, Edit3, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  readonly onRecordTransaction: (ingredient: Ingredient) => void;
  readonly onViewHistory: (ingredient: Ingredient) => void;
}

export function InventoryTable({
  ingredients,
  onRecordTransaction,
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
            <TableHead>Status</TableHead>
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
                  <TableCell>
                    {isLow ? (
                      <Badge
                        variant="destructive"
                        className="flex w-fit items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRecordTransaction(ingredient)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Update</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(ingredient)}
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
