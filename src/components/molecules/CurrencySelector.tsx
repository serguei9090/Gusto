import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Currency } from "@/modules/core/settings/services/currency.repository";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

interface CurrencySelectorProps {
  readonly value: string;
  readonly onChange: (currency: string) => void;
  readonly label?: string;
  readonly className?: string;
}

export function CurrencySelector({
  value,
  onChange,
  label = "Currency",
  className,
}: Readonly<CurrencySelectorProps>) {
  const { currencies, loadCurrencies } = useCurrencyStore();

  useEffect(() => {
    if (currencies.length === 0) {
      loadCurrencies();
    }
  }, [currencies.length, loadCurrencies]);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies
            .filter((c: Currency) => c.isActive)
            .map((currency: Currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
