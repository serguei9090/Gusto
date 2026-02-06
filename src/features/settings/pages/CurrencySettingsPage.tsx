import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useCurrencyStore } from "@/features/settings/store/currency.store";
import { AddCurrencyDialog } from "../components/AddCurrencyDialog";
import { AddExchangeRateDialog } from "../components/AddExchangeRateDialog";

export function CurrencySettingsPage() {
  const {
    currencies,
    exchangeRates,
    baseCurrency,
    loadCurrencies,
    loadExchangeRates,
    setBaseCurrency,
  } = useCurrencyStore();

  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState(false);
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [selectedBaseCurrency, setSelectedBaseCurrency] =
    useState(baseCurrency);

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
                    <Button variant="outline" size="sm">
                      {currency.isActive ? "Disable" : "Enable"}
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
    </div>
  );
}
