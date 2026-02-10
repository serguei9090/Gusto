import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { useCurrencyStore } from "../store/currency.store";

/**
 * Optional callback to navigate to advanced currency settings.
 * Injected via a module-level store or context if needed.
 */
let navigateToCurrencySettings: (() => void) | undefined;

export function setNavigateToCurrencySettings(fn: () => void) {
  navigateToCurrencySettings = fn;
}

export const CurrencySection = () => {
  const { t } = useTranslation();
  const { currencies, baseCurrency, loadCurrencies, setBaseCurrency } =
    useCurrencyStore();

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{t("settings.currency.title")}</CardTitle>
          <CardDescription>
            {t("settings.currency.description")}
          </CardDescription>
        </div>
        {navigateToCurrencySettings && (
          <Button onClick={navigateToCurrencySettings} variant="outline">
            Advanced Settings
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>{t("settings.currency.baseLabel")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("settings.currency.baseHelp")}
            </p>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="w-[240px]">
                <SelectValue
                  placeholder={t("settings.currency.selectCurrency")}
                />
              </SelectTrigger>
              <SelectContent>
                {currencies
                  .filter((c) => c.isActive)
                  .map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name} ({curr.symbol})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
