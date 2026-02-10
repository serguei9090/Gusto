import { AlertTriangle, Package } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { StatCard } from "@/modules/core/dashboard/components/StatCard";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";
import {
  formatCurrencyAmount,
  getBaseCurrency,
} from "@/utils/currencyConverter";

export const InventoryValueWidget = () => {
  const { t } = useTranslation();
  const { summary } = useDashboardStore();
  const baseCurrency = getBaseCurrency();

  return (
    <StatCard
      title={t("dashboard.stockValue")}
      value={formatCurrencyAmount(
        summary?.totalInventoryValue || 0,
        baseCurrency,
      )}
      icon={Package}
      description={t("dashboard.stats.totalInventoryValue")}
    />
  );
};

export const LowStockWidget = () => {
  const { t } = useTranslation();
  const { summary } = useDashboardStore();

  return (
    <StatCard
      title={t("dashboard.stats.lowStockItems")}
      value={summary?.lowStockCount || 0}
      icon={AlertTriangle}
      description={t("dashboard.stats.belowMinLevel")}
      className={summary?.lowStockCount ? "border-destructive/50" : ""}
    />
  );
};
