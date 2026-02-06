import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBasket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  const { modules, moduleOrder } = useSettingsStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const moduleConfig: Record<string, { label: string; icon: any }> = {
    dashboard: { label: t("navigation.dashboard"), icon: LayoutDashboard },
    ingredients: { label: t("navigation.ingredients"), icon: ShoppingBasket },
    recipes: { label: t("navigation.recipes"), icon: ChefHat },
    inventory: { label: t("navigation.inventory"), icon: Package },
    suppliers: { label: t("navigation.suppliers"), icon: Users },
    prepsheets: { label: t("navigation.prepSheets"), icon: ClipboardList },
    settings: { label: t("navigation.settings"), icon: Settings },
  };

  // Filter and sort items based on order and visibility, ensuring settings is always last
  const displayItems = [
    ...moduleOrder
      .filter((id) => {
        const normalizedId = id === "prepSheets" ? "prepsheets" : id;
        return modules[id] && moduleConfig[normalizedId];
      })
      .map((id) => {
        const normalizedId = id === "prepSheets" ? "prepsheets" : id;
        return { id: normalizedId, ...moduleConfig[normalizedId] };
      }),
    { id: "settings", ...moduleConfig.settings }, // Always append settings at the end
  ];

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-card border-r flex flex-col h-full shadow-sm overflow-hidden"
    >
      <div className={`h-16 flex items-center border-b text-primary font-bold text-lg transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <ShoppingBasket size={24} className="shrink-0" />
              <span className="text-sm ml-2">RestHelper</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {displayItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            type="button"
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative
              ${currentView === item.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
              ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </nav>
    </motion.aside>
  );
};
