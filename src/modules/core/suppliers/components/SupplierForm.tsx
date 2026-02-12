import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldHelp } from "@/components/ui/field-help";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileFormFooter } from "@/components/ui/mobile-form-footer";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import type {
  Supplier,
  SupplierFormData,
} from "@/modules/core/suppliers/types";
import { createSupplierSchema } from "@/utils/validators";

interface SupplierFormProps {
  initialData: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SupplierForm({
  initialData,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: Readonly<SupplierFormProps>) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
      accountNumber: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          contactPerson: initialData.contactPerson || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
          paymentTerms: initialData.paymentTerms || "",
          accountNumber: initialData.accountNumber || "",
          notes: initialData.notes || "",
        });
      } else {
        reset({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          paymentTerms: "",
          accountNumber: "",
          notes: "",
        });
      }
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-[425px] sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg border-x-0 sm:border p-4 pt-6 max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Make changes to the supplier details below."
              : "Enter the details for the new supplier."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 pb-0 sm:pb-0"
        >
          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Supplier Name <span className="text-destructive">*</span>
                <FieldHelp helpText={t("suppliers.help.name")} />
              </Label>
              <Input
                id="name"
                placeholder="e.g. Acme Food Supplies"
                {...register("name")}
                className="h-12"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label
                htmlFor="contactPerson"
                className="flex items-center gap-2"
              >
                Contact Person
                <FieldHelp helpText={t("suppliers.help.contactPerson")} />
              </Label>
              <Input
                id="contactPerson"
                placeholder="e.g. John Doe"
                {...register("contactPerson")}
                className="h-12"
              />
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email
                  <FieldHelp helpText={t("suppliers.help.email")} />
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sales@acme.com"
                  {...register("email")}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Phone
                  <FieldHelp helpText={t("suppliers.help.phone")} />
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 234 567 890"
                  {...register("phone")}
                  className="h-12"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                Address
                <FieldHelp helpText={t("suppliers.help.address")} />
              </Label>
              <Input
                id="address"
                placeholder="Full business address"
                {...register("address")}
                className="h-12"
              />
            </div>

            {/* Payment Terms & Account Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="paymentTerms"
                  className="flex items-center gap-2"
                >
                  Payment Terms
                  <FieldHelp helpText={t("suppliers.help.paymentTerms")} />
                </Label>
                <Input
                  id="paymentTerms"
                  placeholder="e.g. Net 30, COD"
                  {...register("paymentTerms")}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="AC-12345"
                  {...register("accountNumber")}
                  className="h-12"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details..."
                {...register("notes")}
              />
            </div>
          </div>

          <MobileFormFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              {isLoading
                ? "Saving..."
                : initialData
                  ? "Update Supplier"
                  : "Create Supplier"}
            </Button>
          </MobileFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
