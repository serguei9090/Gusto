import { AnimatePresence, motion } from "framer-motion";
import { Menu, Settings } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/images/logo.png";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettingsStore } from "@/modules/core/settings/store/settings.store";

export type View =
  | "dashboard"
  | "ingredients"
  | "recipes"
  | "inventory"
  | "suppliers"
  | "prepsheets"
  | "calculators"
  | "settings"
  | "currency-settings"
  | "app-config";

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

import { useRegistry } from "@/lib/modules/registry";
import type { ModuleDefinition } from "@/types/module";

export const Sidebar = ({ currentView, onChangeView }: SidebarProps) => {
  const { t } = useTranslation();
  const { modules, moduleOrder } = useSettingsStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const reg = useRegistry();

  // Filter and sort items based on order and visibility, excluding settings from main list
  const allRegistered = reg.getAll();

  // 1. Get items from the user's custom order
  const orderedItems = moduleOrder
    .filter((id) => {
      const normalizedId = id.toLowerCase();
      if (normalizedId === "settings") return false;

      const module = reg.get(normalizedId);
      if (!module) return false;

      const isVisible = modules[id] ?? modules[normalizedId] ?? true;
      return isVisible;
    })
    .map((id) => {
      const normalizedId = id.toLowerCase();
      const module = reg.get(normalizedId);
      if (!module) return null;

      const tKey = `navigation.${normalizedId}`;
      const translated = t(tKey);

      return {
        id: normalizedId,
        label: translated === tKey ? module.title : translated,
        icon: module.icon,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // 2. Add modules that are in the registry but NOT in the store's moduleOrder (like a new Pro module)
  const discoveryItems = allRegistered
    .filter((m: ModuleDefinition) => {
      const id = m.id.toLowerCase();
      return (
        id !== "settings" &&
        !moduleOrder.some((oid) => oid.toLowerCase() === id)
      );
    })
    .map((m: ModuleDefinition) => {
      const tKey = `navigation.${m.id.toLowerCase()}`;
      const translated = t(tKey);
      return {
        id: m.id.toLowerCase(),
        label: translated === tKey ? m.title : translated,
        icon: m.icon,
      };
    });

  const displayItems = [...orderedItems, ...discoveryItems];

  // Specifically get the settings module for the bottom button
  const settingsMod = reg.get("settings");
  const settingsTKey = "navigation.settings";
  const settingsTranslated = t(settingsTKey);

  const settingsConfig = settingsMod
    ? {
        label:
          settingsTranslated === settingsTKey
            ? settingsMod.title
            : settingsTranslated,
        icon: settingsMod.icon,
      }
    : {
        label:
          settingsTranslated === settingsTKey
            ? t("navigation.settings")
            : settingsTranslated,
        icon: Settings,
      };

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-card border-r flex flex-col h-full shadow-sm overflow-hidden"
    >
      <div
        className={`h-16 flex items-center border-b text-primary font-bold text-lg transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "justify-between px-4"} `}
      >
        <AnimatePresence>
          {isCollapsed ? null : (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <img
                src={logo}
                alt="Gusto Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="text-sm ml-2 font-bold">Gusto</span>
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
              ${
                currentView === item.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
              ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} className="shrink-0" />
            <AnimatePresence>
              {isCollapsed ? null : (
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

      {/* Settings Button */}
      <div className="p-2 border-t">
        <button
          onClick={() => onChangeView("settings")}
          type="button"
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative
            ${
              currentView === "settings"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? settingsConfig.label : undefined}
        >
          <settingsConfig.icon size={20} className="shrink-0" />
          <AnimatePresence>
            {isCollapsed ? null : (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {settingsConfig.label}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Version Footer */}
      <div className="p-3 border-t bg-muted/30">
        <AnimatePresence>
          {isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-muted-foreground text-center"
            >
              v1.0
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-muted-foreground text-center"
            >
              Gusto v1.0.0
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
