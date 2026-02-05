import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema } from "@/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Ingredient, TransactionType } from "@/features/inventory/types";

interface TransactionModalProps {
    ingredient: Ingredient;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export function TransactionModal({
    ingredient,
    open,
    onOpenChange,
    onSubmit,
    isLoading,
}: TransactionModalProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createTransactionSchema),
        defaultValues: {
            ingredientId: ingredient.id,
            transactionType: "purchase" as TransactionType,
            quantity: 0,
            costPerUnit: ingredient.pricePerUnit || 0,
            totalCost: 0,
            reference: "",
            notes: "",
        },
    });

    // Reset form when ingredient changes or modal opens
    useEffect(() => {
        if (open) {
            reset({
                ingredientId: ingredient.id,
                transactionType: "purchase" as TransactionType,
                quantity: 0,
                costPerUnit: ingredient.pricePerUnit || 0,
                totalCost: 0,
                reference: "",
                notes: "",
            });
        }
    }, [open, ingredient, reset]);

    const watchedQty = watch("quantity") || 0;
    const watchedPrice = watch("costPerUnit") || 0;
    const totalCost = watchedQty * watchedPrice;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Stock: {ingredient.name}</DialogTitle>
                    <DialogDescription>
                        Record a stock transaction.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 py-2">

                        {/* Transaction Type */}
                        <div className="space-y-2">
                            <Label htmlFor="transactionType">Transaction Type</Label>
                            <Select
                                onValueChange={(val) => setValue("transactionType", val as TransactionType)}
                                defaultValue="purchase"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="purchase">Purchase (Add Stock)</SelectItem>
                                    <SelectItem value="usage">Usage (Subtract Stock)</SelectItem>
                                    <SelectItem value="waste">Waste (Subtract Stock)</SelectItem>
                                    <SelectItem value="adjustment">Adjustment (Stock Count)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.transactionType && (
                                <p className="text-sm text-destructive">{errors.transactionType.message as string}</p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity ({ingredient.unitOfMeasure})</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="any"
                                {...register("quantity", { valueAsNumber: true })}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-destructive">{errors.quantity.message as string}</p>
                            )}
                        </div>

                        {/* Price Per Unit */}
                        <div className="space-y-2">
                            <Label htmlFor="costPerUnit">Price per Unit ($)</Label>
                            <Input
                                id="costPerUnit"
                                type="number"
                                step="0.01"
                                {...register("costPerUnit", { valueAsNumber: true })}
                            />
                        </div>

                        {/* Total Cost Display */}
                        <div className="space-y-2">
                            <Label>Total Cost</Label>
                            <div className="p-2 bg-muted rounded-md font-mono font-medium">
                                ${totalCost.toFixed(2)}
                            </div>
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference / Invoice #</Label>
                            <Input
                                id="reference"
                                placeholder="e.g. INV-12345"
                                {...register("reference")}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Reason for adjustment..."
                                {...register("notes")}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Transaction"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
