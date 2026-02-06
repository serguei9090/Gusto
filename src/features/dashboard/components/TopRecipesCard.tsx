import { DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { TopRecipeItem } from "../types";

interface TopRecipesCardProps {
  recipes: TopRecipeItem[];
}

export function TopRecipesCard({ recipes }: TopRecipesCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t("dashboard.highMarginRecipes")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <p>{t("dashboard.noRecipeData")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">{recipe.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3 mr-0.5" />
                    {recipe.selling_price.toFixed(2)}
                  </div>
                </div>
                <Badge
                  variant={recipe.profit_margin >= 30 ? "secondary" : "outline"}
                  className={
                    recipe.profit_margin >= 30
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : ""
                  }
                >
                  {recipe.profit_margin.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
