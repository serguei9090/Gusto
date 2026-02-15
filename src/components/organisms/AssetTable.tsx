import { AlertCircle, Edit3, History } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
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
import type { Asset } from "@/types/asset.types";
import { formatCurrencyAmount } from "@/utils/currencyConverter";

interface AssetTableProps {
  readonly assets: Asset[];
  readonly onEdit: (asset: Asset) => void;
  readonly onViewHistory: (asset: Asset) => void;
}

export function AssetTable({ assets, onEdit, onViewHistory }: AssetTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Min Level</TableHead>
            <TableHead>Cost / Unit</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No assets found.
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => {
              const isLow =
                asset.minStockLevel !== null &&
                asset.currentStock <= asset.minStockLevel;

              return (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {asset.assetType}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{asset.category}</TableCell>
                  <TableCell>
                    <span
                      className={isLow ? "text-destructive font-medium" : ""}
                    >
                      {Number(asset.currentStock.toFixed(2))}{" "}
                      {asset.unitOfMeasure}
                    </span>
                  </TableCell>
                  <TableCell>
                    {asset.minStockLevel !== null &&
                    asset.minStockLevel !== undefined
                      ? `${Number(asset.minStockLevel.toFixed(2))} ${asset.unitOfMeasure}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {formatCurrencyAmount(
                      asset.pricePerUnit,
                      asset.currency || "USD",
                    )}
                    <span className="text-muted-foreground text-xs ml-1">
                      / {asset.unitOfMeasure}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatCurrencyAmount(
                      asset.currentStock * asset.pricePerUnit,
                      asset.currency || "USD",
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
                      onClick={() => onEdit(asset)}
                      title="Edit Details"
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Edit Details</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(asset)}
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
