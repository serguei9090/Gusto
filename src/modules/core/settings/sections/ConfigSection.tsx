import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { CategoryConfigModal } from "../components/CategoryConfigModal";
import { UnitConfigModal } from "../components/UnitConfigModal";

export const ConfigSection = () => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<
    "units" | "ingredient_category" | "recipe_category" | null
  >(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.config.title")}</CardTitle>
          <CardDescription>{t("settings.config.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  {t("settings.config.units")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("settings.config.unitsDesc")}
                </p>
              </div>
              <Button
                onClick={() => setActiveModal("units")}
                variant="outline"
                size="sm"
              >
                {t("settings.config.manage")}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  {t("settings.config.ingredientCategories")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("settings.config.ingredientCategoriesDesc")}
                </p>
              </div>
              <Button
                onClick={() => setActiveModal("ingredient_category")}
                variant="outline"
                size="sm"
              >
                {t("settings.config.manage")}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  {t("settings.config.recipeCategories")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("settings.config.recipeCategoriesDesc")}
                </p>
              </div>
              <Button
                onClick={() => setActiveModal("recipe_category")}
                variant="outline"
                size="sm"
              >
                {t("settings.config.manage")}
              </Button>
            </div>
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
