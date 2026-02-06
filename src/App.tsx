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
import { SuppliersPage } from "@/features/suppliers";
import { initDb } from "@/lib/db";
import { RecipesPage } from "./features/recipes/components/RecipesPage";
import { SettingsPage } from "./features/settings/SettingsPage";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  // Initialize database on mount
  useEffect(() => {
    initDb();
  }, []);

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
        return <SettingsPage />;
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
