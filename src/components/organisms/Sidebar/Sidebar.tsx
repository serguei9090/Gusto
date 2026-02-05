import { LayoutDashboard, ShoppingBasket, ChefHat, Package, Users, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";

export type View = "dashboard" | "ingredients" | "recipes" | "inventory" | "suppliers" | "settings";

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
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <ShoppingBasket size={24} />
                RestaurantManage
            </div>
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`${styles.navItem} ${currentView === item.id ? styles.active : ""}`}
                        onClick={() => onChangeView(item.id as View)}
                        type="button"
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};
