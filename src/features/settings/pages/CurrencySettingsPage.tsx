import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddCurrencyDialog } from "@/features/settings/components/AddCurrencyDialog";
import { AddExchangeRateDialog } from "@/features/settings/components/AddExchangeRateDialog";
import { useCurrencyStore } from "@/features/settings/store/currency.store";

export function CurrencySettingsPage() {
  const {
    currencies,
    exchangeRates,
    baseCurrency,
    loadCurrencies,
    loadExchangeRates,
    setBaseCurrency,
    toggleCurrencyStatus,
    deleteCurrency,
  } = useCurrencyStore();

  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState(false);
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [selectedBaseCurrency, setSelectedBaseCurrency] =
    useState(baseCurrency);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCurrencies();
    loadExchangeRates();
  }, [loadCurrencies, loadExchangeRates]);

  useEffect(() => {
    setSelectedBaseCurrency(baseCurrency);
  }, [baseCurrency]);

  const handleBaseCurrencyChange = async (value: string) => {
    setSelectedBaseCurrency(value);
    await setBaseCurrency(value);
  };

  const handleDeleteCurrency = async () => {
    if (!currencyToDelete) return;
    try {
      await deleteCurrency(currencyToDelete);
      toast.success(`Currency ${currencyToDelete} deleted successfully`);
      setCurrencyToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete currency",
      );
      // Keep dialog open? No, maybe close and let toast show error.
      // But user might want to try again? Error is typically "In Use", so trying again won't help.
      setCurrencyToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Currency Settings</h1>
        <p className="text-muted-foreground">
          Manage currencies and exchange rates for multi-currency support
        </p>
      </div>

      {/* Base Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Base Currency</CardTitle>
          <CardDescription>
            Select the default currency for your restaurant. All costs will be
            converted to this currency for calculations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={selectedBaseCurrency}
              onValueChange={handleBaseCurrencyChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select base currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  .filter((c) => c.isActive)
                  .map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Current: {baseCurrency}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Currency Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Currencies</CardTitle>
            <CardDescription>
              Manage available currencies for ingredients and recipes
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddCurrencyOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Currency
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Decimals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>{currency.decimalPlaces}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        currency.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {currency.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCurrencyStatus(currency.code)}
                    >
                      {currency.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setCurrencyToDelete(currency.code)}
                      disabled={currency.code === baseCurrency}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exchange Rates Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exchange Rates</CardTitle>
            <CardDescription>
              Manage currency conversion rates for accurate cost calculations
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddRateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No exchange rates defined. Add rates to enable
                    multi-currency conversions.
                  </TableCell>
                </TableRow>
              ) : (
                exchangeRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.fromCurrency}
                    </TableCell>
                    <TableCell>{rate.toCurrency}</TableCell>
                    <TableCell>{rate.rate.toFixed(2)}</TableCell>
                    <TableCell>{rate.effectiveDate}</TableCell>
                    <TableCell>{rate.source || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddCurrencyDialog
        open={isAddCurrencyOpen}
        onOpenChange={setIsAddCurrencyOpen}
      />
      <AddExchangeRateDialog
        open={isAddRateOpen}
        onOpenChange={setIsAddRateOpen}
      />

      <Dialog
        open={!!currencyToDelete}
        onOpenChange={(open) => !open && setCurrencyToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Currency</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currencyToDelete}? This action
              cannot be undone. References in exchange rates will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrencyToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCurrency}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
