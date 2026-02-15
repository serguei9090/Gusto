import { Edit3, Eye, Mail, MapPin, Phone, Trash2 } from "lucide-react";
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
import type { Supplier } from "@/modules/core/suppliers/types";

interface SupplierTableProps {
  suppliers: Supplier[];
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

export function SupplierTable({
  suppliers,
  onView,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Terms</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No suppliers found.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm"
                    onClick={() => onView(supplier)}
                  >
                    {supplier.name}
                  </button>
                  {supplier.address && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {supplier.address}
                    </div>
                  )}
                </TableCell>
                <TableCell>{supplier.contactPerson || "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    )}
                    {!supplier.email && !supplier.phone && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.paymentTerms ? (
                    <Badge variant="outline">{supplier.paymentTerms}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(supplier)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(supplier)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(supplier.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
