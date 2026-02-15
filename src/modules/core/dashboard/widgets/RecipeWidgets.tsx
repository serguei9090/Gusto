import { ChefHat, Percent } from "lucide-react";
import { StatCard } from "@/components/atoms/StatCard";
import { useTranslation } from "@/hooks/useTranslation";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";

export const AvgMarginWidget = () => {
  const { t } = useTranslation();
  const { summary } = useDashboardStore();

  return (
    <StatCard
      title={t("dashboard.avgMargin")}
      value={`${summary?.avgProfitMargin.toFixed(1) || 0}%`}
      icon={Percent}
      description={t("dashboard.stats.acrossAllRecipes")}
    />
  );
};

export const ActiveRecipesWidget = () => {
  const { t } = useTranslation();
  const { summary } = useDashboardStore();

  return (
    <StatCard
      title={t("dashboard.stats.totalRecipes")}
      value={summary?.recipeCount || 0}
      icon={ChefHat}
      description={t("dashboard.stats.activeRecipes")}
    />
  );
};
