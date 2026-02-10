import { Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { GlobalErrorBarrier } from "@/components/error/GlobalErrorBarrier";
import type { View } from "@/components/Sidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { initDb } from "@/lib/db";
import { useRegistry } from "@/lib/modules/registry";
import { CurrencySettingsPage } from "@/modules/core/settings/pages/CurrencySettingsPage";

function App() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const reg = useRegistry();

  // Initialize database and modules on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize once on mount
  useEffect(() => {
    const init = async () => {
      await initDb();
      await reg.initialize();
    };
    init();
  }, []); // Run once on mount

  const renderContent = () => {
    // Check for special internal views first
    if (currentView === "currency-settings") {
      return <CurrencySettingsPage />;
    }

    const module = reg.get(currentView);
    if (module) {
      if (module.id === "settings") {
        const SettingsComp = module.component as React.ComponentType<{
          onNavigateToCurrencySettings: () => void;
        }>;
        return (
          <SettingsComp
            onNavigateToCurrencySettings={() =>
              setCurrentView("currency-settings")
            }
          />
        );
      }
      return <module.component />;
    }

    // Default fallback
    const ingredients = reg.get("ingredients");
    return ingredients ? <ingredients.component /> : null;
  };

  const getTitle = () => {
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
