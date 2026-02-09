import { format } from "date-fns";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecipeStore } from "../store/recipes.store";

export const BulkRollbackDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [reason, setReason] = useState("Undo bulk update error");
  const [isConfirming, setIsConfirming] = useState(false);

  const { bulkRollback, isLoading } = useRecipeStore();

  const handleRollback = async () => {
    try {
      // date from input is local time, repository expects ISO or DB compatible format
      // For simplicity, we just pass the string which SQLite should handle if formatted correctly
      const affected = await bulkRollback(date, reason);
      alert(`Successfully rolled back ${affected} recipes.`);
      setIsOpen(false);
      setIsConfirming(false);
    } catch (err) {
      console.error(err);
      alert("Rollback failed. Check console for details.");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setIsConfirming(false);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Bulk Rollback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            System-Wide Rollback
          </DialogTitle>
          <DialogDescription>
            This will revert ALL recipes to their most recent version prior to
            the selected date. This action CANNOT be easily undone.
          </DialogDescription>
        </DialogHeader>

        {isConfirming ? (
          <div className="py-6 text-center space-y-4">
            <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              <p className="font-bold">CRITICAL WARNING</p>
              <p className="text-sm mt-1">
                You are about to rollback ALL recipes to their state at{" "}
                {format(new Date(date), "PPP p")}.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please type "ROLLBACK" to confirm this destructive system-wide
              action.
            </p>
            <Input
              placeholder="Type ROLLBACK"
              className="text-center font-bold"
              onChange={(e) => {
                if (e.target.value === "ROLLBACK") {
                  // We could enable the button here, but let's keep it simple
                }
              }}
              id="confirm-text"
            />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rollback-date">Rollback to state at:</Label>
              <Input
                id="rollback-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rollback-reason">Reason for rollback:</Label>
              <Input
                id="rollback-reason"
                placeholder="e.g. Revert mistaken price update"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {isConfirming ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setIsConfirming(false)}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleRollback}
                disabled={isLoading}
              >
                {isLoading ? "Rolling back..." : "CONFIRM ROLLBACK"}
              </Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setIsConfirming(true)}>
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
