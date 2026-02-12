import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettingsSections } from "./registry";
import { setNavigateToCurrencySettings } from "./sections/CurrencySection";
import { useSettingsStore } from "./store/settings.store";

interface SettingsPageProps {
  onNavigateToCurrencySettings?: () => void;
  onNavigateToAppConfig?: () => void;
  onBack?: () => void;
}

export const SettingsPage = ({
  onNavigateToCurrencySettings,
}: SettingsPageProps) => {
  const { t } = useTranslation();
  const { resetDefaults } = useSettingsStore();
  const sections = useSettingsSections();

  // Wire up the navigation for the CurrencySection
  useEffect(() => {
    if (onNavigateToCurrencySettings) {
      setNavigateToCurrencySettings(onNavigateToCurrencySettings);
    }
  }, [onNavigateToCurrencySettings]);

  return (
    <div className="h-full flex flex-col space-y-6 p-4 md:p-8 pt-6 md:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        <Button
          variant="outline"
          size="default"
          onClick={resetDefaults}
          className="w-full md:w-auto md:h-9 md:px-3"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("settings.currency.resetDefaults")}
        </Button>
      </div>

      <div className="flex-1 space-y-6">
        {/* Render all registered settings sections */}
        {sections.map((section) => {
          const Component = section.component;
          return <Component key={section.id} />;
        })}
      </div>
    </div>
  );
};
