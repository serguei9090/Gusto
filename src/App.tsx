import { useState } from "react";
import { MainLayout } from "@/components/templates/MainLayout";
import { type View } from "@/components/organisms/Sidebar";
import { IngredientsPage } from "@/components/pages/IngredientsPage";
import { RecipesPage } from "@/components/pages/RecipesPage";

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
                return <div style={{ padding: 20 }}>Inventory (Coming in v0.0.3)</div>;
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
