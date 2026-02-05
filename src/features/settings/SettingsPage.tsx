import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    SUPPORTED_CURRENCIES,
    getCurrencyName,
    getCurrencySymbol,
} from "@/utils/currency";
import { useSettingsStore } from "./store/settings.store";
import { RotateCcw } from "lucide-react";

export const SettingsPage = () => {
    const { t, changeLanguage, currentLanguage } = useTranslation();
    const {
        baseCurrency,
        exchangeRates,
        setBaseCurrency,
        setExchangeRate,
        resetDefaults,
    } = useSettingsStore();

    const handleRateChange = (currency: string, value: string) => {
        const rate = Number.parseFloat(value);
        if (!Number.isNaN(rate) && rate > 0) {
            setExchangeRate(currency as any, rate);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-4xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
                <p className="text-muted-foreground mt-1">
                    {t("settings.subtitle")}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.general.title")}</CardTitle>
                    <CardDescription>
                        {t("settings.general.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t("settings.general.languageLabel")}</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                            {t("settings.general.languageHelp")}
                        </p>
                        <Select
                            value={currentLanguage}
                            onValueChange={(val) => changeLanguage(val as any)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t("settings.general.selectLanguage")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{t("settings.currency.title")}</CardTitle>
                            <CardDescription>
                                {t("settings.currency.description")}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetDefaults}
                            title={t("settings.currency.resetDefaults")}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t("settings.currency.resetDefaults")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t("settings.currency.baseLabel")}</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                            {t("settings.currency.baseHelp")}
                        </p>
                        <Select
                            value={baseCurrency}
                            onValueChange={(val) => setBaseCurrency(val as any)}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t("settings.currency.selectCurrency")} />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_CURRENCIES.map((curr) => (
                                    <SelectItem key={curr} value={curr}>
                                        {getCurrencySymbol(curr)} - {getCurrencyName(curr)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label>{t("settings.currency.exchangeRatesLabel", { currency: baseCurrency })}</Label>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {SUPPORTED_CURRENCIES.map((curr) => {
                                const isBase = curr === baseCurrency;
                                return (
                                    <div
                                        key={curr}
                                        className={`p-4 rounded-lg border ${isBase ? "bg-muted/50 border-primary/20" : "bg-card"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor={`rate-${curr}`} className="font-semibold">
                                                {getCurrencyName(curr)} ({getCurrencySymbol(curr)})
                                            </Label>
                                            {isBase && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    {t("settings.currency.baseBadge")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">1 {baseCurrency} =</span>
                                            <Input
                                                id={`rate-${curr}`}
                                                type="number"
                                                step="0.01"
                                                min="0.0001"
                                                disabled={isBase}
                                                value={isBase ? "1.00" : exchangeRates[curr]}
                                                onChange={(e) => handleRateChange(curr, e.target.value)}
                                                className="font-mono"
                                            />
                                            <span className="text-sm font-medium">{curr}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
