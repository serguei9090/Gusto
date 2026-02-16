import { format } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileFormFooter } from "@/components/ui/mobile-form-footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slot } from "@/lib/slots/Slot";
import { inventoryRepository } from "@/modules/core/inventory/services/inventory.repository";
import type {
  Ingredient,
  InventoryTransaction,
  TransactionType,
} from "@/modules/core/inventory/types";
import type { Asset } from "@/types/asset.types";
import { formatCurrencyAmount } from "@/utils/currencyConverter";

interface InventoryHistoryModalProps {
  item: Ingredient | Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case "purchase":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
    case "usage":
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
    case "waste":
      return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100";
    case "adjustment":
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100";
  }
};

const getTransactionDisplayName = (type: TransactionType) => {
  switch (type) {
    case "adjustment":
      return "Stock Count";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export function InventoryHistoryModal({
  item,
  open,
  onOpenChange,
}: Readonly<InventoryHistoryModalProps>) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to determine if item is an asset
  const isAsset = "assetType" in item;

  useEffect(() => {
    if (open && item) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const data = isAsset
            ? await inventoryRepository.getTransactionsByAsset(item.id)
            : await inventoryRepository.getTransactionsByIngredient(item.id);
          setTransactions(data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [open, item, isAsset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[80vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] outline-none"
      >
        <DialogHeader className="p-4 sm:p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle>Stock History: {item.name}</DialogTitle>
            <DialogDescription>
              View past transactions for this {isAsset ? "asset" : "ingredient"}
              .
            </DialogDescription>
          </div>

          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 -mr-2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-0">
          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Loading history...
            </div>
          ) : transactions.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              No transactions found.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Ref / Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getTransactionColor(tx.transactionType)}
                          >
                            {getTransactionDisplayName(tx.transactionType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {tx.quantity > 0 ? "+" : ""}
                          {tx.quantity} {item.unitOfMeasure}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyAmount(
                            tx.costPerUnit || 0,
                            tx.currency || "USD",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyAmount(
                            tx.totalCost || 0,
                            tx.currency || "USD",
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {tx.reference || tx.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List View */}
              <div className="sm:hidden space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getTransactionColor(tx.transactionType)}
                          >
                            {getTransactionDisplayName(tx.transactionType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {tx.quantity > 0 ? "+" : ""}
                          {tx.quantity} {item.unitOfMeasure}
                        </div>
                      </div>
                    </div>
                    {(tx.reference || tx.notes) && (
                      <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        {tx.reference && (
                          <span className="font-mono mr-2">{tx.reference}</span>
                        )}
                        {tx.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <MobileFormFooter className="shrink-0">
          <Button
            className="flex-1 h-12 text-lg sm:flex-none sm:h-9 sm:text-sm max-sm:font-bold"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Slot name="inventory-history:footer" />
        </MobileFormFooter>
      </DialogContent>
    </Dialog>
  );
}
