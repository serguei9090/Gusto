```javascript
import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export type View =
  | "dashboard"
  | "ingredients"
  | "recipes"
  | "inventory"
  | "suppliers"
  | "prepsheets"
  | "settings";

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

export const Sidebar = ({ currentView, onChangeView }: SidebarProps) => {
  const { t } = useTranslation();

  const navItems = [
    { id: "dashboard", label: t("navigation.dashboard"), icon: LayoutDashboard },
    { id: "ingredients", label: t("navigation.ingredients"), icon: ShoppingBasket },
    { id: "recipes", label: t("navigation.recipes"), icon: ChefHat },
    { id: "inventory", label: t("navigation.inventory"), icon: Package },
    { id: "suppliers", label: t("navigation.suppliers"), icon: Users },
    { id: "prepsheets", label: t("navigation.prepSheets"), icon: ClipboardList },
    { id: "prepsheets", label: t("navigation.prepSheets"), icon: ClipboardList },
    { id: "settings", label: t("navigation.settings"), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-full shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 border-b text-primary font-bold text-lg">
        <div className="flex items-center gap-2">
          <ShoppingBasket size={24} />
          <span className="hidden md:inline text-sm">RestHelper</span>
        </div>
        <LanguageSwitcher />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            type="button"
            className={`
w - full flex items - center gap - 3 px - 3 py - 2 rounded - md text - sm font - medium transition - colors
              ${
  currentView === item.id
    ? "bg-primary text-primary-foreground"
    : "text-muted-foreground hover:bg-muted hover:text-foreground"
}
`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
