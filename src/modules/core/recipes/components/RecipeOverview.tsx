import { AlertTriangle, Clock, Info, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecipeWithIngredients } from "@/types/ingredient.types";

interface RecipeOverviewProps {
  recipe: RecipeWithIngredients;
}

export const RecipeOverview = ({ recipe }: RecipeOverviewProps) => {
  const costPerServing = recipe.totalCost
    ? recipe.totalCost / recipe.servings
    : 0;

  const margin = recipe.profitMargin || 0;

  const getMarginCardClass = (m: number) => {
    if (m < 20) return "border-destructive/50 bg-destructive/10";
    if (m < 30) return "border-yellow-500/50 bg-yellow-500/10";
    return "border-green-500/50 bg-green-500/10";
  };

  const getMarginTextClass = (m: number) => {
    if (m < 20) return "text-destructive";
    if (m < 30) return "text-yellow-700 dark:text-yellow-500";
    return "text-green-700 dark:text-green-500";
  };

  return (
    <div className="space-y-8 h-full" id="printable-recipe">
      {/* Recipe Header Info */}
      <div className="space-y-4">
        <div>
          <Badge
            variant="outline"
            className="mb-2 print:text-black print:border-black"
          >
            {recipe.category || "Uncategorized"}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {recipe.name}
          </h1>
        </div>

        <div className="flex gap-6 text-muted-foreground print:text-black">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              Yield:{" "}
              <span className="font-medium text-foreground print:text-black">
                {recipe.yieldAmount
                  ? `${recipe.yieldAmount} ${recipe.yieldUnit}`
                  : `${recipe.servings} servings`}
              </span>
            </span>
          </div>
          {recipe.prepTimeMinutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Prep Time:{" "}
                <span className="font-medium text-foreground print:text-black">
                  {recipe.prepTimeMinutes} mins
                </span>
              </span>
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="text-muted-foreground print:text-black">
            {recipe.description}
          </p>
        )}

        {/* Dietary & Allergen Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {recipe.dietaryRestrictions &&
            recipe.dietaryRestrictions.length > 0 &&
            recipe.dietaryRestrictions.map((diet) => (
              <Badge
                key={diet}
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3" />
                {diet}
              </Badge>
            ))}
          {recipe.allergens &&
            recipe.allergens.length > 0 &&
            recipe.allergens.map((allergen) => (
              <Badge
                key={allergen}
                variant="secondary"
                className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                {allergen}
              </Badge>
            ))}
        </div>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost per Serving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costPerServing.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selling Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${recipe.sellingPrice?.toFixed(2) || "0.00"}
              {!recipe.sellingPrice && (
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  (Est.)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className={getMarginCardClass(margin)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMarginTextClass(margin)}`}>
              {recipe.profitMargin?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        {recipe.calories && (
          <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Info className="h-3.5 w-3.5" />
                Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {recipe.calories}{" "}
                <span className="text-sm font-normal">kcal</span>
              </div>
              <p className="text-[10px] text-blue-600/70 dark:text-blue-400/50">
                per serving
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ingredients Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Ingredients & Cost Breakdown
        </h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipe.ingredients.map((ing) => (
                <TableRow key={ing.id} className="print:border-b-gray-200">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{ing.ingredientName}</span>
                      {ing.isSubRecipe && (
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                          Sub-Recipe
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ing.quantity} {ing.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ${ing.currentPricePerUnit?.toFixed(2)} /{" "}
                    {ing.ingredientUnit}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${ing.cost?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-muted/50 font-medium">
              {(recipe.wasteBufferPercentage || 0) > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={3}>Subtotal</TableCell>
                    <TableCell className="text-right">
                      $
                      {(
                        (recipe.totalCost || 0) /
                        (1 + (recipe.wasteBufferPercentage || 0) / 100)
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-orange-600">
                    <TableCell colSpan={3}>
                      Waste Buffer ({recipe.wasteBufferPercentage}%)
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      +$
                      {(
                        ((recipe.totalCost || 0) *
                          (recipe.wasteBufferPercentage || 0)) /
                        (100 + (recipe.wasteBufferPercentage || 0))
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </>
              )}
              <TableRow>
                <TableCell colSpan={3} className="font-bold">
                  Total Batch Cost
                </TableCell>
                <TableCell className="text-right font-black text-lg">
                  ${recipe.totalCost?.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* Cooking Instructions */}
      {recipe.cookingInstructions && (
        <div className="space-y-4 break-before-page">
          <h3 className="text-lg font-semibold border-b pb-2">
            Cooking Instructions
          </h3>
          <div className="prose dark:prose-invert max-w-none text-muted-foreground print:text-black whitespace-pre-line">
            {recipe.cookingInstructions}
          </div>
        </div>
      )}
    </div>
  );
};
