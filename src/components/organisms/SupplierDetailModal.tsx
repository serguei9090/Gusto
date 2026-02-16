import { Mail, MapPin, Phone, Printer, User, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MobileFormFooter } from "@/components/ui/mobile-form-footer";
import type { Supplier } from "@/modules/core/suppliers/types";

interface SupplierDetailModalProps {
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierDetailModal = ({
  supplier,
  onClose,
}: SupplierDetailModalProps) => {
  const handlePrint = () => {
    globalThis.print();
  };

  return (
    <Dialog open={!!supplier} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg border-x-0 sm:border p-0 sm:max-h-[85vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between print:hidden sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Supplier Information
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mr-6">
            <Button variant="outline" onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 print:p-0 print:overflow-visible pb-24">
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

        <MobileFormFooter className="shrink-0">
          <Button
            className="flex-1 h-12 text-lg sm:flex-none sm:h-9 sm:text-sm max-sm:font-bold"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </MobileFormFooter>
      </DialogContent>
    </Dialog>
  );
};
