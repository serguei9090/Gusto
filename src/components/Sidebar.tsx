import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBasket,
  Users,
} from "lucide-react";

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
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ingredients", label: "Ingredients", icon: ShoppingBasket },
    { id: "recipes", label: "Recipes", icon: ChefHat },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "suppliers", label: "Suppliers", icon: Users },
    { id: "prepsheets", label: "Prep Sheets", icon: ClipboardList },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-full shadow-sm">
      <div className="h-16 flex items-center gap-2 px-6 border-b text-primary font-bold text-lg">
        <ShoppingBasket size={24} />
        RestaurantManage
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            type="button"
            className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
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
