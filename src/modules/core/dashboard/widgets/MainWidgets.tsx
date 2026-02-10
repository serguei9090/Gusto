import { TopRecipesCard } from "@/modules/core/dashboard/components/TopRecipesCard";
import { UrgentReordersCard } from "@/modules/core/dashboard/components/UrgentReordersCard";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";

export const UrgentReordersWidget = () => {
  const { urgentReorders } = useDashboardStore();
  return <UrgentReordersCard items={urgentReorders} />;
};

export const TopRecipesWidget = () => {
  const { topRecipes } = useDashboardStore();
  return <TopRecipesCard recipes={topRecipes} />;
};
