import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddCurrencyDialog } from "@/components/organisms/AddCurrencyDialog";
import { AddExchangeRateDialog } from "@/components/organisms/AddExchangeRateDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataCard, DataCardList } from "@/components/ui/data-card";
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
import { useTranslation } from "@/hooks/useTranslation";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

interface CurrencySettingsPageProps {
  onBack?: () => void;
}

export function CurrencySettingsPage({ onBack }: CurrencySettingsPageProps) {
  const { t } = useTranslation();
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
      setCurrencyToDelete(null);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6 pb-32 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Currency Settings</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage currencies and exchange rates
          </p>
        </div>
      </div>

      {/* Base Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base Currency</CardTitle>
          <CardDescription>
            Select the default currency for calculations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Select
              value={selectedBaseCurrency}
              onValueChange={handleBaseCurrencyChange}
            >
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Select base currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  .filter((c) => c.isActive)
                  .map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="font-bold">{currency.code}</span> -{" "}
                      {currency.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Current System Base:{" "}
              <span className="font-bold text-foreground">{baseCurrency}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Currency Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Available Currencies</CardTitle>
            <CardDescription>Manage active currencies</CardDescription>
          </div>
          <Button onClick={() => setIsAddCurrencyOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                    <TableCell className="font-medium">
                      {currency.code}
                    </TableCell>
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
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-2"
                        onClick={() => setCurrencyToDelete(currency.code)}
                        disabled={currency.code === baseCurrency}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden px-4 pb-4">
            <DataCardList
              items={currencies}
              renderItem={(currency) => (
                <DataCard
                  key={currency.code}
                  title={currency.code}
                  subtitle={currency.name}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        variant={currency.isActive ? "outline" : "secondary"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => toggleCurrencyStatus(currency.code)}
                      >
                        {currency.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => setCurrencyToDelete(currency.code)}
                        disabled={currency.code === baseCurrency}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  }
                  details={[
                    { label: "Symbol", value: currency.symbol },
                    { label: "Decimals", value: currency.decimalPlaces },
                    {
                      label: "Status",
                      value: (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${currency.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {currency.isActive ? "Active" : "Inactive"}
                        </span>
                      ),
                    },
                  ]}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Exchange Rates</CardTitle>
            <CardDescription>Conversion rates for calculations</CardDescription>
          </div>
          <Button onClick={() => setIsAddRateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                      <TableCell>{rate.rate.toFixed(4)}</TableCell>
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
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden px-4 pb-4">
            <DataCardList
              items={exchangeRates}
              emptyMessage="No exchange rates defined."
              renderItem={(rate) => (
                <DataCard
                  key={rate.id}
                  title={`${rate.fromCurrency} → ${rate.toCurrency}`}
                  subtitle={`Rate: ${rate.rate.toFixed(4)}`}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  }
                  details={[
                    { label: "Effective Date", value: rate.effectiveDate },
                    { label: "Source", value: rate.source || "-" },
                  ]}
                />
              )}
            />
          </div>
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

      <DeleteConfirmDialog
        currencyToDelete={currencyToDelete}
        setCurrencyToDelete={setCurrencyToDelete}
        handleDeleteCurrency={handleDeleteCurrency}
      />

      {/* Back Button / Cancel Button */}
      {onBack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t bg-background/80 backdrop-blur-sm md:static md:p-0 md:border-t-0 md:mt-8 md:pb-0 md:bg-transparent">
          <Button
            variant="outline"
            className="w-full md:w-auto h-12 md:h-10 text-lg md:text-sm font-bold"
            onClick={onBack}
          >
            {t("common.actions.cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}

interface DeleteConfirmDialogProps {
  currencyToDelete: string | null;
  setCurrencyToDelete: (code: string | null) => void;
  handleDeleteCurrency: () => void;
}

function DeleteConfirmDialog({
  currencyToDelete,
  setCurrencyToDelete,
  handleDeleteCurrency,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={!!currencyToDelete}
      onOpenChange={(open) => !open && setCurrencyToDelete(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Currency</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {currencyToDelete}? This action
            cannot be undone.
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
  );
}
