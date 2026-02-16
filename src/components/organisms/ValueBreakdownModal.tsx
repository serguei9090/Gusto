import { DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileFormFooter } from "@/components/ui/mobile-form-footer";

interface ValueBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredientsValue: number;
  assetsValue: number;
  totalValue: number;
}

export function ValueBreakdownModal({
  open,
  onOpenChange,
  ingredientsValue,
  assetsValue,
  totalValue,
}: Readonly<ValueBreakdownModalProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-md sm:h-auto sm:max-h-[80vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] outline-none"
      >
        <DialogHeader className="p-4 sm:p-6 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Value Breakdown
          </DialogTitle>
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
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card transition-colors">
              <span className="font-medium text-sm sm:text-base">
                Consumables
              </span>
              <span className="font-bold text-lg">
                $
                {ingredientsValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card transition-colors">
              <span className="font-medium text-sm sm:text-base">
                Assets/Equipment
              </span>
              <span className="font-bold text-lg">
                $
                {assetsValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center px-4">
              <span className="text-lg font-semibold">Total Valuation</span>
              <span className="text-2xl font-bold text-primary">
                $
                {totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
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
