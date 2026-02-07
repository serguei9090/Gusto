import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inventoryRepository } from "@/features/inventory/services/inventory.repository";
import type {
  Ingredient,
  InventoryTransaction,
} from "@/features/inventory/types";
import { formatCurrencyAmount } from "@/utils/currencyConverter";

interface InventoryHistoryModalProps {
  ingredient: Ingredient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryHistoryModal({
  ingredient,
  open,
  onOpenChange,
}: InventoryHistoryModalProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && ingredient) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const data = await inventoryRepository.getTransactionsByIngredient(
            ingredient.id,
          );
          setTransactions(data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [open, ingredient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Stock History: {ingredient.name}</DialogTitle>
          <DialogDescription>
            View past transactions for this ingredient.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {tx.transactionType}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          tx.transactionType === "usage" ||
                          tx.transactionType === "waste"
                            ? "text-destructive"
                            : "text-green-600"
                        }
                      >
                        {tx.transactionType === "usage" ||
                        tx.transactionType === "waste"
                          ? "-"
                          : "+"}
                        {tx.quantity} {ingredient.unitOfMeasure}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.costPerUnit
                        ? formatCurrencyAmount(
                            tx.costPerUnit,
                            ingredient.currency || "USD",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {tx.reference || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
