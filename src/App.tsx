import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { GlobalErrorBarrier } from "@/components/error/GlobalErrorBarrier";
import type { View } from "@/components/Sidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { initDb } from "@/lib/db";
import { useRegistry } from "@/lib/modules/registry";
import { CurrencySettingsPage } from "@/modules/core/settings/pages/CurrencySettingsPage";
import { useConfigStore } from "@/modules/core/settings/store/config.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const { initialize: initializeCurrency } = useCurrencyStore();
  const reg = useRegistry();

  // Initialize database and currency store on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize once on mount
  useEffect(() => {
    const init = async () => {
      await initDb();
      await initializeCurrency();
      await useConfigStore.getState().loadConfig();
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
    return module?.title || "";
  };

  return (
    <GlobalErrorBarrier>
      <MainLayout
        currentView={currentView}
        onChangeView={setCurrentView}
        title={getTitle()}
      >
        {renderContent()}
      </MainLayout>
      <Toaster position="bottom-right" richColors closeButton />
    </GlobalErrorBarrier>
  );
}

export default App;
