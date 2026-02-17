import { BarChart3, Info, TrendingDown, Wallet } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRecipeStore } from "../../../recipes/store/recipes.store";
import { useExpensesStore } from "../../store/expenses.store";
import { useIncomeStore } from "../../store/income.store";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";
import { RecipePerformanceTable } from "../molecules/RecipePerformanceTable";
import { RecipeMarginAuditModal } from "../organisms/RecipeMarginAuditModal";

export function AnalysisTab() {
  const { entries: incomeEntries, loadIncome } = useIncomeStore();
  const { fixedExpenses, variableExpenses, loadExpenses } = useExpensesStore();
  const { recipes, fetchRecipes } = useRecipeStore();

  useEffect(() => {
    loadIncome();
    loadExpenses();
    fetchRecipes();
  }, [loadIncome, loadExpenses, fetchRecipes]);

  const analysis = useMemo(() => {
    const totalRevenue = incomeEntries.reduce((sum, e) => sum + e.amount, 0);

    const totalFixed = fixedExpenses.reduce((sum, e) => {
      if (!e.is_active) return sum;
      return e.period === "Yearly" ? sum + e.amount / 12 : sum + e.amount;
    }, 0);

    const totalVariable = variableExpenses.reduce((sum, e) => {
      if (!e.is_active) return sum;
      if (e.type === "PercentOfSales") {
        return sum + (e.rate / 100) * totalRevenue;
      }
      return sum + e.rate;
    }, 0);

    const totalActualExpenses = totalFixed + totalVariable;

    let theoreticalRecipeCost = 0;
    incomeEntries.forEach((entry) => {
      if (entry.recipe_id) {
        const recipe = recipes.find((r) => r.id === entry.recipe_id);
        if (recipe?.totalCost) {
          theoreticalRecipeCost += (entry.quantity || 1) * recipe.totalCost;
        }
      }
    });

    const netProfit = totalRevenue - totalActualExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const foodCostPercentage =
      totalRevenue > 0 ? (theoreticalRecipeCost / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalActualExpenses,
      theoreticalRecipeCost,
      netProfit,
      profitMargin,
      foodCostPercentage,
    };
  }, [incomeEntries, fixedExpenses, variableExpenses, recipes]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                <CurrencyDisplay amount={analysis.totalRevenue} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Actual Expenses
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Includes <strong>Fixed Costs</strong> (Rent, Insurance)
                      and <strong>Variable Burdens</strong> (Credit Card Fees,
                      Delivery Commissions) that scale with sales.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                <CurrencyDisplay amount={analysis.totalActualExpenses} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${analysis.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                <CurrencyDisplay amount={analysis.netProfit} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Theoretical vs Actual
              </CardTitle>
              <CardDescription className="flex items-center justify-between gap-4">
                <span>Comparing recipes against recorded expenses.</span>
                <RecipeMarginAuditModal recipes={recipes} />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Theoretical Recipe Cost</span>
                  <span className="font-medium">
                    <CurrencyDisplay amount={analysis.theoreticalRecipeCost} />
                  </span>
                </div>
                <Progress value={analysis.foodCostPercentage} className="h-2" />
                <p className="text-[10px] text-muted-foreground">
                  Based on quantities sold and recipe definitions.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">
                      Food Cost % (Theoretical)
                    </span>
                  </div>
                  <span
                    className={`font-bold ${analysis.foodCostPercentage > 35 ? "text-orange-600" : "text-green-600"}`}
                  >
                    {analysis.foodCostPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Net Profit Margin
                    </span>
                  </div>
                  <span className="font-bold">
                    {analysis.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Insight
              </CardTitle>
              <CardDescription>
                Quick summary of financial health.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                Your <strong>Theoretical Food Cost</strong> is{" "}
                <CurrencyDisplay amount={analysis.theoreticalRecipeCost} />.
                {analysis.theoreticalRecipeCost === 0 &&
                analysis.totalRevenue > 0 ? (
                  <span className="block mt-2 p-2 bg-amber-50 text-amber-800 rounded text-xs border border-amber-200">
                    💡 <strong>Tip:</strong> Link your revenue entries to
                    specific recipes in the <strong>Income</strong> tab to see
                    your theoretical food costs and margins.
                  </span>
                ) : (
                  "If your actual ingredient purchases are much higher than this, you may have issues with waste, theft, or inconsistent portioning."
                )}
              </p>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Break-even Status
                </h4>
                <p className="text-xs text-muted-foreground">
                  Currently, your revenue covers{" "}
                  {analysis.totalRevenue > 0
                    ? (
                        (analysis.totalRevenue / analysis.totalActualExpenses) *
                        100
                      ).toFixed(0)
                    : 0}
                  % of your recorded expenses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipe Performance Table */}
        <RecipePerformanceTable
          recipes={recipes}
          incomeEntries={incomeEntries}
        />
      </div>
    </TooltipProvider>
  );
}
