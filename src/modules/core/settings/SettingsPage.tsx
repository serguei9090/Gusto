import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
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
  const isMobile = useMobile();
  const { resetDefaults } = useSettingsStore();
  const sections = useSettingsSections();

  return (
    <div
      className={`h-full flex flex-col space-y-6 ${isMobile ? "p-4" : "p-8"}`}
    >
      <div
        className={`flex justify-between items-center ${isMobile ? "flex-col items-start gap-4" : ""}`}
      >
        <div className="space-y-1">
          <h2
            className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold tracking-tight`}
          >
            {t("settings.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={resetDefaults}
          className={isMobile ? "w-full" : ""}
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
