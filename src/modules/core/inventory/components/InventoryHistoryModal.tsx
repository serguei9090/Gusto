import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileCard } from "@/components/mobile/MobileCardList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "@/hooks/useTranslation";
import { Slot } from "@/lib/slots/Slot";
import { inventoryRepository } from "@/modules/core/inventory/services/inventory.repository";
import type {
  Ingredient,
  InventoryTransaction,
} from "@/modules/core/inventory/types";
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
}: Readonly<InventoryHistoryModalProps>) {
  const { t } = useTranslation();
  const isMobile = useMobile();
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
      <DialogContent
        className={`${isMobile ? "w-full max-w-full rounded-none border-x-0 p-4 pt-6 top-16 translate-y-0 h-full" : "sm:max-w-[700px]"} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>Stock History: {ingredient.name}</DialogTitle>
          <DialogDescription>
            View past transactions for this ingredient.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`overflow-auto border rounded-md ${isMobile ? "border-0" : "max-h-[60vh]"}`}
        >
          {isMobile ? (
            <div className="space-y-3 pb-safe">
              {isLoading && <div className="p-4 text-center">Loading...</div>}
              {!isLoading && transactions.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No transactions found.
                </div>
              )}
              {!isLoading &&
                transactions.map((tx) => {
                  const isDebit =
                    tx.transactionType === "usage" ||
                    tx.transactionType === "waste" ||
                    (tx.transactionType === "adjustment" && tx.quantity < 0);

                  let prefix = "";
                  if (
                    tx.transactionType !== "adjustment" &&
                    !isDebit &&
                    tx.quantity > 0
                  ) {
                    prefix = "+";
                  }

                  return (
                    <MobileCard
                      key={tx.id}
                      title={format(
                        new Date(tx.createdAt),
                        "MMM d, yyyy HH:mm",
                      )}
                      subtitle={tx.transactionType}
                      details={[
                        {
                          label: "Quantity",
                          value: (
                            <span
                              className={
                                isDebit
                                  ? "text-destructive font-bold"
                                  : "text-green-600 font-bold"
                              }
                            >
                              {prefix}
                              {Number(tx.quantity.toFixed(2))}{" "}
                              {ingredient.unitOfMeasure}
                            </span>
                          ),
                        },
                        {
                          label: "Cost",
                          value: tx.costPerUnit
                            ? formatCurrencyAmount(
                                tx.costPerUnit,
                                ingredient.currency || "USD",
                              )
                            : "-",
                        },
                        {
                          label: "Ref",
                          value: tx.reference || "-",
                        },
                      ]}
                    />
                  );
                })}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost/Unit</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  transactions.map((tx) => {
                    const isDebit =
                      tx.transactionType === "usage" ||
                      tx.transactionType === "waste" ||
                      (tx.transactionType === "adjustment" && tx.quantity < 0);

                    let prefix = "";
                    if (
                      tx.transactionType !== "adjustment" &&
                      !isDebit &&
                      tx.quantity > 0
                    ) {
                      prefix = "+";
                    }

                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.transactionType === "purchase" && (
                              <div
                                className="p-1 rounded-full bg-green-100 text-green-700"
                                title="Purchase"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                            )}
                            {(tx.transactionType === "usage" ||
                              tx.transactionType === "waste") && (
                              <div
                                className="p-1 rounded-full bg-red-100 text-red-700"
                                title={tx.transactionType}
                              >
                                <ArrowDownLeft className="h-4 w-4" />
                              </div>
                            )}
                            {tx.transactionType === "adjustment" && (
                              <div
                                className="p-1 rounded-full bg-blue-100 text-blue-700"
                                title="Stock Count"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </div>
                            )}
                            <span className="capitalize">
                              {tx.transactionType === "adjustment"
                                ? "Stock Count"
                                : tx.transactionType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isDebit
                                ? "text-destructive font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {prefix}
                            {Number(tx.quantity.toFixed(2))}{" "}
                            {ingredient.unitOfMeasure}
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
                        <TableCell className="font-mono text-xs">
                          {tx.totalCost === null
                            ? "-"
                            : formatCurrencyAmount(
                                tx.totalCost,
                                ingredient.currency || "USD",
                              )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {tx.reference || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter
          className={`${
            isMobile
              ? "sticky -bottom-4 -mx-4 px-4 pb-safe z-20 glass-footer flex flex-row gap-2 pt-4 border-t bg-background"
              : "sm:justify-end border-t pt-4"
          }`}
        >
          <Button
            className={isMobile ? "flex-1 h-12" : ""}
            variant={isMobile ? "default" : "outline"}
            onClick={() => onOpenChange(false)}
          >
            {isMobile ? "Close History" : t("common.labels.close")}
          </Button>
          <Slot name="inventory-history:footer" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
