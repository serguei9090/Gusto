import { AlertTriangle, ChefHat, Package, Percent } from "lucide-react";
import { useEffect } from "react";
import { useDashboardStore } from "@/features/dashboard/store/dashboard.store";
import { StatCard } from "./StatCard";
import { TopRecipesCard } from "./TopRecipesCard";
import { UrgentReordersCard } from "./UrgentReordersCard";

export const DashboardPage = () => {
  const {
    summary,
    urgentReorders,
    topRecipes,
    fetchDashboardData,
    error,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Stock Value"
          value={`$${summary?.totalInventoryValue.toFixed(2) || "0.00"}`}
          icon={Package}
          description="Total inventory value"
        />
        <StatCard
          title="Low Stock Items"
          value={summary?.lowStockCount || 0}
          icon={AlertTriangle}
          description="Items below minimum level"
          className={summary?.lowStockCount ? "border-destructive/50" : ""}
        />
        <StatCard
          title="Avg. Margin"
          value={`${summary?.avgProfitMargin.toFixed(1) || 0}%`}
          icon={Percent}
          description="Across all recipes"
        />
        <StatCard
          title="Total Recipes"
          value={summary?.recipeCount || 0}
          icon={ChefHat}
          description="Active recipes"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <UrgentReordersCard items={urgentReorders} />
        </div>
        <div className="col-span-3">
          <TopRecipesCard recipes={topRecipes} />
        </div>
      </div>
    </div>
  );
};
