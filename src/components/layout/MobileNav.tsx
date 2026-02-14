import { History, Home, Settings, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export const MobileNav = ({ currentView, onChangeView }: MobileNavProps) => {
  const { t } = useTranslation();

  const navItems = [
    { id: "dashboard", label: t("navigation.dashboard"), icon: Home },
    { id: "recipes", label: t("navigation.recipes"), icon: UtensilsCrossed },
    { id: "inventory", label: t("navigation.inventory"), icon: History },
    { id: "settings", label: t("navigation.settings"), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-card border-t flex items-center justify-around px-2 z-50 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeView(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
