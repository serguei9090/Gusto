import { Reorder } from "framer-motion";
import { GripVertical, RotateCcw } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { useCurrencyStore } from "./store/currency.store";
import { useSettingsStore } from "./store/settings.store";

interface SettingsPageProps {
  onNavigateToCurrencySettings?: () => void;
}

export const SettingsPage = ({
  onNavigateToCurrencySettings,
}: SettingsPageProps) => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { modules, moduleOrder, toggleModule, reorderModules, resetDefaults } =
    useSettingsStore();

  const { currencies, baseCurrency, loadCurrencies, setBaseCurrency } =
    useCurrencyStore();

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex justify-between items-center space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("settings.title")}
          </h2>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={resetDefaults}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("settings.currency.resetDefaults")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.general.title")}</CardTitle>
          <CardDescription>{t("settings.general.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="language">
                {t("settings.general.languageLabel")}
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("settings.general.languageHelp")}
              </span>
            </div>
            <Select
              value={currentLanguage}
              onValueChange={(val) => changeLanguage(val as "en" | "es")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t("settings.general.selectLanguage")}
                />
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{t("settings.currency.title")}</CardTitle>
            <CardDescription>
              {t("settings.currency.description")}
            </CardDescription>
          </div>
          {onNavigateToCurrencySettings && (
            <Button onClick={onNavigateToCurrencySettings} variant="outline">
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

            <div className="flex justify-end">
              <Button
                onClick={onNavigateToCurrencySettings}
                variant="link"
                className="text-primary p-0 h-auto"
              >
                Advanced Currency & Exchange Rate Management →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.modules.title")}</CardTitle>
          <CardDescription>{t("settings.modules.description")}</CardDescription>
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
                    <Label
                      htmlFor={`module-${moduleId}`}
                      className="cursor-pointer font-medium"
                    >
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
                    onCheckedChange={(checked) =>
                      toggleModule(moduleId, checked)
                    }
                  />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About RestHelper</CardTitle>
          <CardDescription>Application information and support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Build Date</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h4 className="text-sm font-semibold">About This Application</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              RestHelper is a comprehensive restaurant management system
              designed to streamline operations including recipe costing,
              inventory tracking, prep sheet management, and multi-currency
              support. Built with modern technologies to help restaurant
              professionals manage their business efficiently.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <h4 className="text-sm font-semibold">Support & Contact</h4>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                For support, feature requests, or bug reports:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Email: support@resthelper.com</li>
                <li>• Documentation: docs.resthelper.com</li>
                <li>• GitHub: github.com/resthelper/app</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 text-xs text-muted-foreground text-center border-t">
            © {new Date().getFullYear()} RestHelper. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
