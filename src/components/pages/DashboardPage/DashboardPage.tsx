import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { StatCard } from "@/components/molecules/StatCard";
import {
    AlertTriangle,
    TrendingUp
} from "lucide-react";
import styles from "./DashboardPage.module.css";

export const DashboardPage = () => {
    const { summary, urgentReorders, topRecipes, fetchDashboardData, isLoading } = useDashboardStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (isLoading && !summary) {
        return <div className={styles.loading}>Loading Dashboard...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.stats}>
                <StatCard
                    label="Stock Value"
                    value={`$${summary?.totalInventoryValue?.toFixed(2) || "0.00"} `}
                />
                <StatCard
                    label="Low Stock Items"
                    value={summary?.lowStockCount?.toString() || "0"}
                />
                <StatCard
                    label="Avg. Profit Margin"
                    value={`${(summary?.avgProfitMargin || 0).toFixed(1)}% `}
                />
                <StatCard
                    label="Total Recipes"
                    value={summary?.recipeCount?.toString() || "0"}
                />
            </div>

            <div className={styles.grid}>
                {/* Urgent Reorders Widget */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <AlertTriangle size={18} color="var(--color-error)" />
                            <span>Urgent Reorders</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        {urgentReorders.length > 0 ? (
                            <div className={styles.reorderList}>
                                {urgentReorders.map(item => (
                                    <div key={item.id} className={styles.reorderItem}>
                                        <div className={styles.reorderInfo}>
                                            <span className={styles.reorderName}>{item.name}</span>
                                            <span className={styles.reorderDeficit}>
                                                Need {item.deficit} {item.unit}
                                            </span>
                                        </div>
                                        <div className={styles.stockStatus}>
                                            <span className={styles.currentVal}>{item.currentStock}</span>
                                            <span className={styles.minVal}>/ {item.minStockLevel}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>All stock levels are healthy!</div>
                        )}
                    </div>
                </div>

                {/* Top Profit Recipes Widget */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <TrendingUp size={18} color="var(--color-success)" />
                            <span>High Margin Recipes</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        {topRecipes.length > 0 ? (
                            <div className={styles.recipeList}>
                                {topRecipes.map((recipe, idx) => (
                                    <div key={idx} className={styles.recipeItem}>
                                        <div className={styles.recipeInfo}>
                                            <span className={styles.recipeName}>{recipe.name}</span>
                                            <span className={styles.recipePrice}>${recipe.selling_price?.toFixed(2)}</span>
                                        </div>
                                        <div className={styles.marginBadge} style={{
                                            background: recipe.profit_margin >= 30 ? "#ecfdf5" : "#fffbeb",
                                            color: recipe.profit_margin >= 30 ? "#047857" : "#b45309"
                                        }}>
                                            {recipe.profit_margin?.toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No recipe data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
