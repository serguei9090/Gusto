import { Mail, MapPin, Phone, Printer, User, Wallet, X } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Supplier } from "@/modules/core/suppliers/types";

interface SupplierDetailModalProps {
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierDetailModal = ({
  supplier,
  onClose,
}: SupplierDetailModalProps) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handlePrint = () => {
    globalThis.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="w-full max-w-2xl bg-card border rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col print:border-0 print:shadow-none print:max-h-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Supplier Information</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-8 print:p-0 print:overflow-visible">
          <div className="space-y-8" id="printable-supplier">
            {/* Main Info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {supplier.name}
              </h1>
              {supplier.contactPerson && (
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {supplier.contactPerson}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supplier.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {!supplier.email && !supplier.phone && (
                    <p className="text-sm text-muted-foreground italic">
                      No contact info provided
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Account/Terms Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Account & Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Payment Terms</p>
                      {supplier.paymentTerms ? (
                        <Badge variant="secondary" className="mt-1">
                          {supplier.paymentTerms}
                        </Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not specified
                        </p>
                      )}
                    </div>
                  </div>
                  {supplier.accountNumber && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Account Number</p>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {supplier.accountNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Address */}
            {supplier.address && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Primary Address
                </h3>
                <p className="text-muted-foreground whitespace-pre-line bg-muted/30 p-4 rounded-md border text-lg">
                  {supplier.address}
                </p>
              </div>
            )}

            {/* Notes */}
            {supplier.notes && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Notes / Internal Comments
                </h3>
                <div className="text-muted-foreground whitespace-pre-line bg-muted/30 p-4 rounded-md border italic">
                  {supplier.notes}
                </div>
              </div>
            )}

            <div className="hidden print:block text-xs text-muted-foreground pt-8 border-t">
              Printed from RestaurantManage System on{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
