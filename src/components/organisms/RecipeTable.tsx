import { AlertTriangle, Edit2, Eye, ShieldCheck, Trash2 } from "lucide-react";
import { ExperimentBadge } from "@/components/atoms/ExperimentBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Recipe } from "@/types/ingredient.types";
import { calculateSuggestedPrice } from "@/utils/costEngine";
import { formatCurrencyAmount } from "@/utils/currencyConverter";

interface RecipeTableProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
  onView: (recipe: Recipe) => void;
}

export const RecipeTable = ({
  recipes,
  onEdit,
  onDelete,
  onView,
}: RecipeTableProps) => {
  const formatCurrency = (val: number | null, currency: string = "USD") => {
    if (val === null || val === undefined) return "-";
    return formatCurrencyAmount(val, currency);
  };

  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return `${val.toFixed(1)}%`;
  };

  const getMarginColor = (val: number | null) => {
    if (val === null || val === undefined) return "text-muted-foreground";
    if (val < 20) return "text-destructive font-medium";
    if (val < 30) return "text-yellow-600 font-medium";
    return "text-green-600 font-medium";
  };

  const getDietaryLabel = (diet: string) => {
    switch (diet) {
      case "Gluten-Free":
        return "GF";
      case "Vegan":
        return "V";
      case "Vegetarian":
        return "VG";
      default:
        return diet.substring(0, 3).toUpperCase();
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg bg-card">
        <p>No recipes found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Servings</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    {recipe.name}
                    {recipe.isExperiment && (
                      <ExperimentBadge
                        experimentName={recipe.experimentName}
                        className="text-[10px] h-4"
                      />
                    )}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {recipe.dietaryRestrictions?.map((diet) => (
                      <span
                        key={diet}
                        className="inline-flex h-4 items-center gap-0.5 rounded-full bg-green-100 px-1.5 text-[9px] font-bold text-green-700 border border-green-200"
                        title={diet}
                      >
                        <ShieldCheck className="h-2 w-2" />
                        {getDietaryLabel(diet)}
                      </span>
                    ))}
                    {recipe.allergens?.map((allergen) => (
                      <span
                        key={allergen}
                        className="inline-flex h-4 items-center gap-0.5 rounded-full bg-red-100 px-1.5 text-[9px] font-bold text-red-700 border border-red-200"
                        title={`Contains ${allergen}`}
                      >
                        <AlertTriangle className="h-2 w-2" />
                        {allergen.substring(0, 3).toUpperCase()}
                      </span>
                    ))}
                    {recipe.calories && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {recipe.calories} kcal
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="capitalize">
                {recipe.category || "-"}
              </TableCell>
              <TableCell>{recipe.servings}</TableCell>
              <TableCell>
                {formatCurrency(recipe.totalCost, recipe.currency)}
              </TableCell>
              <TableCell>
                {recipe.sellingPrice
                  ? formatCurrency(recipe.sellingPrice, recipe.currency)
                  : (() => {
                      const suggested = calculateSuggestedPrice(
                        recipe.totalCost || 0,
                        recipe.targetCostPercentage || 25,
                      );
                      return (
                        <span
                          className="text-muted-foreground italic"
                          title="Suggested Price"
                        >
                          {formatCurrency(suggested, recipe.currency)} (Est.)
                        </span>
                      );
                    })()}
              </TableCell>
              <TableCell>
                <span className={getMarginColor(recipe.profitMargin)}>
                  {formatPercent(recipe.profitMargin)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(recipe)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(recipe)}
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => onDelete(recipe.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
