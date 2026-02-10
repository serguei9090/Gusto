import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardWidgets } from "@/modules/core/dashboard/registry";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const widgets = useDashboardWidgets();
  const { fetchDashboardData, error, isLoading } = useDashboardStore();

  // Wait for currency store to finish loading before fetching dashboard data
  const { currencies, baseCurrency: storeCurrency } = useCurrencyStore();
  const currenciesLoaded = currencies.length > 0 || storeCurrency !== "USD";

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
        {widgets.map((widget) => {
          const Component = widget.component;
          const colSpanMap: Record<number, string> = {
            1: "col-span-1",
            2: "lg:col-span-2 col-span-2",
            3: "lg:col-span-3 col-span-3",
            4: "lg:col-span-4 col-span-4",
          };
          const colSpanClass = colSpanMap[widget.colSpan || 1] || "col-span-1";

          return (
            <div key={widget.id} className={colSpanClass}>
              <Component />
            </div>
          );
        })}
      </div>
    </div>
  );
};
