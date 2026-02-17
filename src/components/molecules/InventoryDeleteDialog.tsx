import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";

interface InventoryDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: Ingredient | Asset | null;
  onConfirm: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const InventoryDeleteDialog = ({
  isOpen,
  onOpenChange,
  item,
  onConfirm,
  isLoading,
  error,
}: InventoryDeleteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="pt-2 text-foreground">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive font-medium border border-destructive/20 mt-2">
            <p className="font-bold mb-1">Cannot Delete</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
          <p className="text-sm font-semibold px-1">
            Deleting: <span className="text-primary">{item?.name}</span>
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-12 sm:h-9"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 sm:h-9 font-bold"
          >
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
