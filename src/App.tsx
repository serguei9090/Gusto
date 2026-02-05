import { useState } from "react";
import { MainLayout } from "@/components/templates/MainLayout";
import { type View } from "@/components/organisms/Sidebar";
import { IngredientsPage } from "@/components/pages/IngredientsPage";
import { RecipesPage } from "@/components/pages/RecipesPage";
import { InventoryPage } from "@/components/pages/InventoryPage";
import { SuppliersPage } from "@/components/pages/SuppliersPage";

function App() {
    const [currentView, setCurrentView] = useState<View>("ingredients");

    const renderContent = () => {
        switch (currentView) {
            case "dashboard":
                return <div style={{ padding: 20 }}>Dashboard Module (Coming in v0.0.2)</div>;
            case "ingredients":
                return <IngredientsPage />;
            case "recipes":
                return <RecipesPage />;
            case "inventory":
                return <InventoryPage />;
            case "suppliers":
                return <SuppliersPage />;
            case "settings":
                return <div style={{ padding: 20 }}>Settings</div>;
            default:
                return <IngredientsPage />;
        }
    };

    const getTitle = () => {
        switch (currentView) {
            case "dashboard": return "Dashboard";
            case "ingredients": return "Ingredient Management";
            case "recipes": return "Recipe Manager";
            case "inventory": return "Inventory Tracker";
            case "suppliers": return "Supplier Directory";
            case "settings": return "Settings";
            default: return "";
        }
    }

    return (
        <MainLayout
            currentView={currentView}
            onChangeView={setCurrentView}
            title={getTitle()}
        >
            {renderContent()}
        </MainLayout>
    );
}

export default App;
