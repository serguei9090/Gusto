import { ChefHat, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Recipe } from "@/types/ingredient.types";
import type { IncomeEntry } from "../../store/income.store";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";

interface Props {
  recipes: Recipe[];
  incomeEntries: IncomeEntry[];
}

interface RecipeStat {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  unitCost: number;
  totalCost: number;
  netMargin: number;
  foodCostPercent: number;
  profitMarginPercent: number;
}

export function RecipePerformanceTable({ recipes, incomeEntries }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    // Aggregate income by recipe
    const aggregation = incomeEntries.reduce(
      (acc, entry) => {
        if (!entry.recipe_id) return acc;

        if (!acc[entry.recipe_id]) {
          acc[entry.recipe_id] = {
            sold: 0,
            revenue: 0,
          };
        }
        acc[entry.recipe_id].sold += entry.quantity || 1;
        acc[entry.recipe_id].revenue += entry.amount;
        return acc;
      },
      {} as Record<number, { sold: number; revenue: number }>,
    );

    // Map to display stats
    const result: RecipeStat[] = [];

    Object.entries(aggregation).forEach(([recipeIdStr, data]) => {
      const recipeId = parseInt(recipeIdStr, 10);
      const recipe = recipes.find((r) => r.id === recipeId);

      if (recipe) {
        const unitCost = recipe.totalCost || 0;
        const totalCost = unitCost * data.sold;
        const netMargin = data.revenue - totalCost;

        result.push({
          id: recipe.id,
          name: recipe.name,
          sold: data.sold,
          revenue: data.revenue,
          unitCost,
          totalCost,
          netMargin,
          foodCostPercent:
            data.revenue > 0 ? (totalCost / data.revenue) * 100 : 0,
          profitMarginPercent:
            data.revenue > 0 ? (netMargin / data.revenue) * 100 : 0,
        });
      }
    });

    return result.sort((a, b) => b.revenue - a.revenue);
  }, [recipes, incomeEntries]);

  const filteredStats = useMemo(() => {
    return stats.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [stats, searchQuery]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Recipe Performance
            </CardTitle>
            <CardDescription>
              Profitability breakdown by menu item based on recorded sales.
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe Name</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Unit Cost (Est)</TableHead>
                <TableHead className="text-right">
                  Total Cost (Theor.)
                </TableHead>
                <TableHead className="text-right">Net Margin</TableHead>
                <TableHead className="text-right">Food Cost %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell className="text-right">{stat.sold}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    <CurrencyDisplay amount={stat.revenue} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <CurrencyDisplay amount={stat.unitCost} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <CurrencyDisplay amount={stat.totalCost} />
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${stat.netMargin >= 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    <CurrencyDisplay amount={stat.netMargin} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        stat.foodCostPercent > 35
                          ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"
                          : "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                      }`}
                    >
                      {stat.foodCostPercent.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStats.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No sales data found for recipes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
