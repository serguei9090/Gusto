import { Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { GlobalErrorBarrier } from "@/components/error/GlobalErrorBarrier";
import { CurrencySettingsPage } from "@/components/pages/CurrencySettingsPage/CurrencySettingsPage";
import { useTranslation } from "@/hooks/useTranslation";
import { initDb } from "@/lib/db";
import { useRegistry } from "@/lib/modules/registry";
import { WelcomeScreen } from "./components/onboarding/WelcomeScreen";
import { MainLayout } from "./components/templates/MainLayout/MainLayout";

function App() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    return localStorage.getItem("hasSeenWelcome") === "true";
  });
  const reg = useRegistry();

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setHasSeenWelcome(true);
  };

  // Initialize database and modules on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize once on mount
  useEffect(() => {
    const init = async () => {
      await initDb();
      await reg.initialize();
    };
    init();
  }, []); // Run once on mount

  if (!hasSeenWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  const renderContent = () => {
    // Check for special internal views first
    if (currentView === "currency-settings") {
      return <CurrencySettingsPage onBack={() => setCurrentView("settings")} />;
    }

    const module = reg.get(currentView);
    if (module) {
      if (module.id === "settings") {
        const SettingsComp = module.component as React.ComponentType<{
          onNavigateToCurrencySettings: () => void;
          onBack?: () => void;
        }>;
        return (
          <SettingsComp
            onNavigateToCurrencySettings={() =>
              setCurrentView("currency-settings")
            }
            onBack={() => setCurrentView("dashboard")}
          />
        );
      }
      return <module.component />;
    }

    // Default fallback - show dashboard if module not found
    const dashboard = reg.get("dashboard");
    return dashboard ? <dashboard.component /> : null;
  };

  const getTitle = () => {
    if (currentView === "currency-settings") {
      return t("settings.currency.title");
    }

    const module = reg.get(currentView);
    if (!module) return "";

    const tKey = `navigation.${module.id}`;
    const translated = t(tKey);
    return translated === tKey ? module.title : translated;
  };

  return (
    <GlobalErrorBarrier>
      <MainLayout
        currentView={currentView}
        onChangeView={setCurrentView}
        title={getTitle()}
      >
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          }
        >
          {renderContent()}
        </Suspense>
      </MainLayout>
      <Toaster position="bottom-right" richColors closeButton />
    </GlobalErrorBarrier>
  );
}

export default App;
