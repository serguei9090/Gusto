import { useTranslation } from "@/hooks/useTranslation";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    SUPPORTED_CURRENCIES,
    getCurrencyName,
    getCurrencySymbol,
} from "@/utils/currency";
import { useSettingsStore } from "./store/settings.store";
import { RotateCcw, GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";

export const SettingsPage = () => {
    const { t, changeLanguage, currentLanguage } = useTranslation();
    const {
        baseCurrency,
        exchangeRates,
        modules,
        moduleOrder,
        setBaseCurrency,
        setExchangeRate,
        toggleModule,
        reorderModules,
        resetDefaults,
    } = useSettingsStore();

    const handleRateChange = (currency: string, value: string) => {
        const rate = Number.parseFloat(value);
        if (!Number.isNaN(rate)) {
            setExchangeRate(currency as any, rate);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 p-8">
            <div className="flex justify-between items-center space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("settings.subtitle")}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetDefaults}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("settings.currency.resetDefaults")}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.general.title")}</CardTitle>
                    <CardDescription>
                        {t("settings.general.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="language">{t("settings.general.languageLabel")}</Label>
                            <span className="text-sm text-muted-foreground">{t("settings.general.languageHelp")}</span>
                        </div>
                        <Select
                            value={currentLanguage}
                            onValueChange={(val) => changeLanguage(val as any)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t("settings.general.selectLanguage")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English (US)</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.currency.title")}</CardTitle>
                    <CardDescription>
                        {t("settings.currency.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>{t("settings.currency.baseLabel")}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t("settings.currency.baseHelp")}
                            </p>
                            <Select
                                value={baseCurrency}
                                onValueChange={(val) => setBaseCurrency(val as any)}
                            >
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder={t("settings.currency.selectCurrency")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(SUPPORTED_CURRENCIES).map((curr) => (
                                        <SelectItem key={curr} value={curr}>
                                            {curr} - {getCurrencyName(curr)} ({getCurrencySymbol(curr)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <Label>{t("settings.currency.exchangeRatesLabel", { currency: baseCurrency })}</Label>
                            {Array.from(SUPPORTED_CURRENCIES).map((curr) => {
                                if (curr === baseCurrency) return null;
                                return (
                                    <div key={curr} className="flex items-center gap-4">
                                        <div className="w-[100px] font-medium flex items-center gap-2">
                                            {curr}
                                            <Badge variant="outline">{getCurrencySymbol(curr)}</Badge>
                                        </div>
                                        <Input
                                            type="number"
                                            step="0.0001"
                                            value={exchangeRates[curr] || ""}
                                            onChange={(e) => handleRateChange(curr, e.target.value)}
                                            className="w-[150px]"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            1 {baseCurrency} = {exchangeRates[curr]} {curr}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.modules.title")}</CardTitle>
                    <CardDescription>
                        {t("settings.modules.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-sm text-muted-foreground mb-4">
                        {t("settings.modules.dragToReorder")}
                    </div>
                    <Reorder.Group
                        axis="y"
                        values={moduleOrder}
                        onReorder={reorderModules}
                        className="space-y-2"
                    >
                        {moduleOrder.map((moduleId) => (
                            <Reorder.Item
                                key={moduleId}
                                value={moduleId}
                                className="flex items-center justify-between p-3 bg-card border rounded-md cursor-move hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <Label htmlFor={`module-${moduleId}`} className="cursor-pointer font-medium">
                                            {t(`navigation.${moduleId}`)}
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {modules[moduleId]
                                            ? t("settings.modules.visible")
                                            : t("settings.modules.hidden")}
                                    </span>
                                    <Switch
                                        id={`module-${moduleId}`}
                                        checked={modules[moduleId] ?? true}
                                        onCheckedChange={(checked) => toggleModule(moduleId, checked)}
                                    />
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </CardContent>
            </Card>
        </div>
    );
};
