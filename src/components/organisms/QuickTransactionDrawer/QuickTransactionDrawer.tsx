import {
  ArrowDownToLine,
  ClipboardCheck,
  PackagePlus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ItemSelector } from "@/components/molecules/ItemSelector";
import { QuickAdjustmentForm } from "@/components/organisms/QuickForms/QuickAdjustmentForm";
import { QuickPurchaseForm } from "@/components/organisms/QuickForms/QuickPurchaseForm";
import { QuickUsageForm } from "@/components/organisms/QuickForms/QuickUsageForm";
import { QuickWasteForm } from "@/components/organisms/QuickForms/QuickWasteForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";

export type TransactionMode = "purchase" | "usage" | "waste" | "adjustment";

interface QuickTransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  mode?: TransactionMode;
}

type Step = "select-item" | "details";

export const QuickTransactionDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  mode = "usage",
}: QuickTransactionDrawerProps) => {
  const [step, setStep] = useState<Step>("select-item");
  const [selectedItem, setSelectedItem] = useState<{
    item: Ingredient | Asset;
    type: "ingredient" | "asset";
  } | null>(null);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("select-item");
        setSelectedItem(null);
      }, 300);
    }
  }, [open]);

  const handleItemSelect = (
    item: Ingredient | Asset,
    type: "ingredient" | "asset",
  ) => {
    setSelectedItem({ item, type });
    setStep("details");
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const modeConfig = {
    purchase: {
      title: "Log Purchase",
      description: "Add new stock from delivery",
      icon: <PackagePlus className="w-5 h-5" />,
      color: "text-green-600 bg-green-100",
    },
    usage: {
      title: "Log Usage",
      description: "Record daily usage",
      icon: <ArrowDownToLine className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-100",
    },
    waste: {
      title: "Log Waste",
      description: "Record spoilage or trim",
      icon: <Trash2 className="w-5 h-5" />,
      color: "text-red-600 bg-red-100",
    },
    adjustment: {
      title: "Quick Count",
      description: "Update exact stock count",
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: "text-orange-600 bg-orange-100",
    },
  };

  const config = modeConfig[mode];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b flex flex-row items-center gap-3 space-y-0 text-left">
          <div className={`p-2 rounded-full ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <SheetTitle>{config.title}</SheetTitle>
            <SheetDescription>{config.description}</SheetDescription>
          </div>

          {step === "details" && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setStep("select-item")}
            >
              Change Item
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "select-item" ? (
            <ItemSelector
              onSelect={handleItemSelect}
              onCancel={() => onOpenChange(false)}
            />
          ) : (
            selectedItem && (
              <>
                {mode === "usage" && (
                  <QuickUsageForm
                    item={selectedItem.item}
                    itemType={selectedItem.type}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                  />
                )}
                {mode === "waste" && (
                  <QuickWasteForm
                    item={selectedItem.item}
                    itemType={selectedItem.type}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                  />
                )}
                {mode === "purchase" && (
                  <QuickPurchaseForm
                    item={selectedItem.item}
                    itemType={selectedItem.type}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                  />
                )}
                {mode === "adjustment" && (
                  <QuickAdjustmentForm
                    item={selectedItem.item}
                    itemType={selectedItem.type}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                  />
                )}
              </>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
