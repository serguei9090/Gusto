import { AlertTriangle, ChefHat, Package, Percent } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";
import {
  formatCurrencyAmount,
  getBaseCurrency,
} from "@/utils/currencyConverter";
import { StatCard } from "./StatCard";
import { TopRecipesCard } from "./TopRecipesCard";
import { UrgentReordersCard } from "./UrgentReordersCard";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const {
    summary,
    urgentReorders,
    topRecipes,
    fetchDashboardData,
    error,
    isLoading,
  } = useDashboardStore();

  // Wait for currency store to finish loading before fetching dashboard data
  const { currencies, baseCurrency: storeCurrency } = useCurrencyStore();
  const currenciesLoaded = currencies.length > 0 || storeCurrency !== "USD";

  const baseCurrency = getBaseCurrency();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run when currencies finish loading
  useEffect(() => {
    // Only fetch dashboard data after currencies have loaded
    if (currenciesLoaded) {
      fetchDashboardData();
    }
  }, [currenciesLoaded]); // Re-fetch when currencies finish loading

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="p-8 text-muted-foreground">Loading dashboard...</div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.stockValue")}
          value={formatCurrencyAmount(
            summary?.totalInventoryValue || 0,
            baseCurrency,
          )}
          icon={Package}
          description={t("dashboard.stats.totalInventoryValue")}
        />
        <StatCard
          title={t("dashboard.stats.lowStockItems")}
          value={summary?.lowStockCount || 0}
          icon={AlertTriangle}
          description={t("dashboard.stats.belowMinLevel")}
          className={summary?.lowStockCount ? "border-destructive/50" : ""}
        />
        <StatCard
          title={t("dashboard.avgMargin")}
          value={`${summary?.avgProfitMargin.toFixed(1) || 0}%`}
          icon={Percent}
          description={t("dashboard.stats.acrossAllRecipes")}
        />
        <StatCard
          title={t("dashboard.stats.totalRecipes")}
          value={summary?.recipeCount || 0}
          icon={ChefHat}
          description={t("dashboard.stats.activeRecipes")}
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
