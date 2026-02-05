import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Supplier } from "@/features/suppliers/types";
import { createSupplierSchema } from "@/utils/validators";

interface SupplierFormProps {
  initialData: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function SupplierForm({
  initialData,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
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
          notes: "",
        });
      }
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Food Supplies"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="e.g. John Doe"
                {...register("contactPerson")}
              />
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sales@acme.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1 234 567 890"
                  {...register("phone")}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Full business address"
                {...register("address")}
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                placeholder="e.g. Net 30, COD"
                {...register("paymentTerms")}
              />
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialData
                  ? "Update Supplier"
                  : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
