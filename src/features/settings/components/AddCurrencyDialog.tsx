import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrencyStore } from "@/features/settings/store/currency.store";

interface AddCurrencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCurrencyDialog({
  open,
  onOpenChange,
}: AddCurrencyDialogProps) {
  const { addCurrency } = useCurrencyStore();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCode("");
    setName("");
    setSymbol("");
    setDecimalPlaces(2);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!code || !name || !symbol) {
      setError("All fields are required");
      return;
    }

    if (code.length !== 3) {
      setError("Currency code must be exactly 3 letters");
      return;
    }

    if (!/^[A-Z]{3}$/.test(code)) {
      setError("Currency code must be 3 uppercase letters");
      return;
    }

    if (decimalPlaces < 0 || decimalPlaces > 4) {
      setError("Decimal places must be between 0 and 4");
      return;
    }

    setIsLoading(true);
    try {
      await addCurrency({
        code: code.toUpperCase(),
        name,
        symbol,
        decimalPlaces,
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add currency");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Currency</DialogTitle>
          <DialogDescription>
            Add a custom currency to use for ingredients and recipes
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Currency Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g., JPY, MXN, BRL"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={3}
                required
              />
              <p className="text-sm text-muted-foreground">
                3-letter ISO 4217 code (e.g., USD, EUR, GBP)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Currency Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Japanese Yen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">
                Symbol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="symbol"
                placeholder="e.g., ¥, $, €"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimals">Decimal Places</Label>
              <Input
                id="decimals"
                type="number"
                min={0}
                max={4}
                value={decimalPlaces}
                onChange={(e) =>
                  setDecimalPlaces(Number.parseInt(e.target.value, 10))
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Number of decimal places for this currency (0-4)
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Currency"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
