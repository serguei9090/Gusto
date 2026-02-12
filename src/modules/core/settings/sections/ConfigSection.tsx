import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "@/hooks/useTranslation";
import { CategoryConfigModal } from "../components/CategoryConfigModal";
import { UnitConfigModal } from "../components/UnitConfigModal";

export const ConfigSection = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const [activeModal, setActiveModal] = useState<
    "units" | "ingredient_category" | "recipe_category" | null
  >(null);

  const ConfigItem = ({
    title,
    description,
    onClick,
  }: {
    title: string;
    description: string;
    onClick: () => void;
  }) => (
    <div
      className={`flex ${isMobile ? "flex-col gap-4" : "items-center justify-between"} p-4 border rounded-xl bg-card/50 hover:bg-muted/30 transition-all duration-200 shadow-sm border-muted/50`}
    >
      <div className="space-y-1">
        <h4 className="text-sm font-bold uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        onClick={onClick}
        variant="secondary"
        size={isMobile ? "default" : "sm"}
        className={isMobile ? "w-full font-bold h-10" : "font-semibold"}
      >
        {t("settings.config.manage")}
      </Button>
    </div>
  );

  return (
    <>
      <Card className={isMobile ? "border-0 shadow-none bg-transparent" : ""}>
        <CardHeader className={isMobile ? "px-0" : ""}>
          <CardTitle>{t("settings.config.title")}</CardTitle>
          <CardDescription>{t("settings.config.description")}</CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-0" : "space-y-6"}>
          <div className="grid gap-4">
            <ConfigItem
              title={t("settings.config.units")}
              description={t("settings.config.unitsDesc")}
              onClick={() => setActiveModal("units")}
            />

            <ConfigItem
              title={t("settings.config.ingredientCategories")}
              description={t("settings.config.ingredientCategoriesDesc")}
              onClick={() => setActiveModal("ingredient_category")}
            />

            <ConfigItem
              title={t("settings.config.recipeCategories")}
              description={t("settings.config.recipeCategoriesDesc")}
              onClick={() => setActiveModal("recipe_category")}
            />
          </div>
        </CardContent>
      </Card>

      <UnitConfigModal
        isOpen={activeModal === "units"}
        onClose={() => setActiveModal(null)}
      />

      <CategoryConfigModal
        isOpen={activeModal === "ingredient_category"}
        onClose={() => setActiveModal(null)}
        type="ingredient_category"
        title={t("settings.config.ingredientCategories")}
        description={t("settings.config.ingredientCategoriesDesc")}
      />

      <CategoryConfigModal
        isOpen={activeModal === "recipe_category"}
        onClose={() => setActiveModal(null)}
        type="recipe_category"
        title={t("settings.config.recipeCategories")}
        description={t("settings.config.recipeCategoriesDesc")}
      />
    </>
  );
};
