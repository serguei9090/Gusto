import { Eye, X } from "lucide-react";
import { useState } from "react";
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
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";

interface LowStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: (Ingredient | Asset)[];
}

export function LowStockModal({
  open,
  onOpenChange,
  items,
}: Readonly<LowStockModalProps>) {
  const [activeType, setActiveType] = useState<
    "all" | "consumables" | "assets"
  >("all");

  const lowStockIngredients = items.filter(
    (item): item is Ingredient => !("assetType" in item),
  );
  const lowStockAssets = items.filter(
    (item): item is Asset => "assetType" in item,
  );

  const filteredItems =
    activeType === "consumables"
      ? lowStockIngredients
      : activeType === "assets"
        ? lowStockAssets
        : [...lowStockIngredients, ...lowStockAssets];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[80vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] outline-none"
      >
        <DialogHeader className="p-4 sm:p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              Low Stock Items
            </DialogTitle>
            <DialogDescription>
              Items needing attention based on minimum stock levels
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType("all")}
            >
              All ({lowStockIngredients.length + lowStockAssets.length})
            </Button>
            <Button
              variant={activeType === "consumables" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType("consumables")}
            >
              Consumables ({lowStockIngredients.length})
            </Button>
            <Button
              variant={activeType === "assets" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType("assets")}
            >
              Assets ({lowStockAssets.length})
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              No low stock items
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">
                        Current Stock
                      </TableHead>
                      <TableHead className="text-right">Min Level</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow
                        key={`${"assetType" in item ? "asset" : "ingredient"}-${item.id}`}
                      >
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {"assetType" in item ? "Asset" : "Consumable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-amber-600">
                          {item.currentStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.minStockLevel || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitOfMeasure}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List View */}
              <div className="sm:hidden space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={`${"assetType" in item ? "asset" : "ingredient"}-${item.id}`}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {"assetType" in item ? "Asset" : "Consumable"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600">
                          {item.currentStock}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.unitOfMeasure}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Min Level: {item.minStockLevel || 0} {item.unitOfMeasure}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <MobileFormFooter>
          <Button
            className="w-full sm:w-auto h-12 sm:h-9 text-lg sm:text-sm max-sm:font-bold"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </MobileFormFooter>
      </DialogContent>
    </Dialog>
  );
}
