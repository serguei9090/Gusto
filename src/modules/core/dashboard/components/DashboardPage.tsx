import { useEffect } from "react";

import { Slot } from "@/lib/slots/Slot";
import { useDashboardWidgets } from "@/modules/core/dashboard/registry";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

export const DashboardPage = () => {
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
    <div className="flex-1 space-y-6 md:space-y-4 p-4 md:p-8 pt-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => {
          const Component = widget.component;

          // Mobile always takes 1 col, desktop respects colSpan
          const colSpanMap: Record<number, string> = {
            1: "col-span-1",
            2: "lg:col-span-2 md:col-span-2 col-span-1",
            3: "lg:col-span-3 md:col-span-2 col-span-1",
            4: "lg:col-span-4 md:col-span-2 col-span-1",
          };
          const colSpanClass = colSpanMap[widget.colSpan || 1] || "col-span-1";

          return (
            <div
              key={widget.id}
              className={`${colSpanClass} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <Component />
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Slot name="dashboard:after" />
      </div>
    </div>
  );
};
