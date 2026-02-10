import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettingsSections } from "./registry";
import { useSettingsStore } from "./store/settings.store";

interface SettingsPageProps {
  onNavigateToCurrencySettings?: () => void;
  onNavigateToAppConfig?: () => void;
}

export const SettingsPage = ({
  onNavigateToCurrencySettings: _onNavigateToCurrencySettings,
  onNavigateToAppConfig: _onNavigateToAppConfig,
}: SettingsPageProps) => {
  const { t } = useTranslation();
  const { resetDefaults } = useSettingsStore();
  const sections = useSettingsSections();

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

      {/* Render all registered settings sections */}
      {sections.map((section) => {
        const Component = section.component;
        return <Component key={section.id} />;
      })}
    </div>
  );
};
