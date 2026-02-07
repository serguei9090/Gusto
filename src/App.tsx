import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { GlobalErrorBarrier } from "@/components/error/GlobalErrorBarrier";
import type { View } from "@/components/Sidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { CalculatorsPage } from "@/features/calculators";
import { DashboardPage } from "@/features/dashboard";
import { IngredientsPage } from "@/features/ingredients";
import { InventoryPage } from "@/features/inventory";
import { PrepSheetsPage } from "@/features/prep-sheets";
import { useCurrencyStore } from "@/features/settings/store/currency.store";
import { SuppliersPage } from "@/features/suppliers";
import { initDb } from "@/lib/db";
import { RecipesPage } from "./features/recipes/components/RecipesPage";
import { CurrencySettingsPage } from "./features/settings/pages/CurrencySettingsPage";
import { SettingsPage } from "./features/settings/SettingsPage";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const { initialize: initializeCurrency } = useCurrencyStore();

  // Initialize database and currency store on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize once on mount
  useEffect(() => {
    const init = async () => {
      await initDb();
      await initializeCurrency();
    };
    init();
  }, []); // Run once on mount

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage />;
      case "ingredients":
        return <IngredientsPage />;
      case "recipes":
        return <RecipesPage />;
      case "inventory":
        return <InventoryPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "prepsheets":
        return <PrepSheetsPage />;
      case "calculators":
        return <CalculatorsPage />;
      case "settings":
        return (
          <SettingsPage
            onNavigateToCurrencySettings={() =>
              setCurrentView("currency-settings")
            }
          />
        );
      case "currency-settings":
        return <CurrencySettingsPage />;
      default:
        return <IngredientsPage />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Dashboard";
      case "ingredients":
        return "Ingredient Management";
      case "recipes":
        return "Recipe Manager";
      case "inventory":
        return "Inventory Tracker";
      case "suppliers":
        return "Supplier Directory";
      case "prepsheets":
        return "Prep Sheets";
      case "calculators":
        return "Math Helpers & Calculators";
      case "settings":
        return "Settings";
      default:
        return "";
    }
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
