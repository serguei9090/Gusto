import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

interface AddExchangeRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExchangeRateDialog({
  open,
  onOpenChange,
}: AddExchangeRateDialogProps) {
  const { currencies, addExchangeRate } = useCurrencyStore();
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [rate, setRate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [source, setSource] = useState("Manual entry");
  const [addInverse, setAddInverse] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeCurrencies = currencies.filter((c) => c.isActive);

  const resetForm = () => {
    setFromCurrency("");
    setToCurrency("");
    setRate("");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
    setSource("Manual entry");
    setAddInverse(true);
    setError("");
  };

  const calculateInverseRate = () => {
    const rateNum = Number.parseFloat(rate);
    if (rateNum && rateNum !== 0) {
      return (1 / rateNum).toFixed(6);
    }
    return "N/A";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fromCurrency || !toCurrency || !rate) {
      setError("All fields are required");
      return;
    }

    if (fromCurrency === toCurrency) {
      setError("From and To currencies must be different");
      return;
    }

    const rateNum = Number.parseFloat(rate);
    if (Number.isNaN(rateNum) || rateNum <= 0) {
      setError("Exchange rate must be a positive number");
      return;
    }

    setIsLoading(true);
    try {
      // Add the main rate
      await addExchangeRate({
        fromCurrency,
        toCurrency,
        rate: rateNum,
        effectiveDate,
        source,
      });

      // Add inverse rate if requested
      if (addInverse) {
        await addExchangeRate({
          fromCurrency: toCurrency,
          toCurrency: fromCurrency,
          rate: 1 / rateNum,
          effectiveDate,
          source: `${source} (inverse)`,
        });
      }

      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add exchange rate",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-md sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg border-x-0 sm:border p-4 pt-6 sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Exchange Rate</DialogTitle>
          <DialogDescription>
            Define a currency conversion rate for cost calculations
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="pb-0 sm:pb-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">
                From Currency <span className="text-destructive">*</span>
              </Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from" className="h-12">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {activeCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">
                To Currency <span className="text-destructive">*</span>
              </Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to" className="h-12">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {activeCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">
                Exchange Rate <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.000001"
                placeholder="e.g., 1.08"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
                className="h-12"
              />
              {fromCurrency && toCurrency && rate && (
                <p className="text-sm text-muted-foreground">
                  1 {fromCurrency} = {rate} {toCurrency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Effective Date</Label>
              <Input
                id="date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="e.g., Manual entry, Bank rate"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inverse"
                checked={addInverse}
                onCheckedChange={(checked) => setAddInverse(checked === true)}
              />
              <Label htmlFor="inverse" className="cursor-pointer">
                Also add inverse rate ({toCurrency || "TO"} →{" "}
                {fromCurrency || "FROM"}: {calculateInverseRate()})
              </Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter className="sticky -bottom-4 -mx-4 px-4 pb-safe pt-4 border-t bg-background sm:static sm:mx-0 sm:px-0 sm:pb-0 sm:pt-0 sm:border-t-0 flex flex-row sm:justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none h-12 sm:h-9"
            >
              {isLoading ? "Adding..." : "Add Rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
