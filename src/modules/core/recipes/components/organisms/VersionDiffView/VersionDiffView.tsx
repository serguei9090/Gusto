import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import type {
  DetailedVersionDiff,
  IngredientDiff,
} from "@/modules/core/recipes/services/recipeVersion.repository";

interface VersionDiffViewProps {
  version1Number: number;
  version2Number: number;
  recipeDiff: DetailedVersionDiff[];
  ingredientDiff: IngredientDiff[];
}

export const VersionDiffView = ({
  version1Number,
  version2Number,
  recipeDiff,
  ingredientDiff,
}: VersionDiffViewProps) => {
  const { ingredients } = useIngredientsStore();

  // Helper to determine if a change is Good or Bad for business
  const getBusinessImpact = (
    percentChange: number | undefined,
    fieldName?: string,
  ): "good" | "bad" | "neutral" => {
    if (!percentChange || percentChange === 0) return "neutral";
    const name = fieldName?.toLowerCase() || "";

    const isProfit =
      name.includes("margin") ||
      name.includes("profit") ||
      name.includes("markup");
    const isCost = name.includes("cost") || name.includes("price");

    if (isProfit) {
      // Profit Up = Good, Profit Down = Bad
      return percentChange > 0 ? "good" : "bad";
    }
    if (isCost) {
      // Cost Up = Bad, Cost Down = Good
      return percentChange > 0 ? "bad" : "good";
    }
    return "neutral"; // Other metrics
  };

  const getImpactColor = (impact: "good" | "bad" | "neutral") => {
    switch (impact) {
      case "good":
        return "text-emerald-600 dark:text-emerald-400";
      case "bad":
        return "text-rose-600 dark:text-rose-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getImpactIcon = (
    percentChange: number,
    impact: "good" | "bad" | "neutral",
  ) => {
    const Icon = percentChange > 0 ? TrendingUp : TrendingDown;
    return <Icon className={`h-3 w-3 ${getImpactColor(impact)}`} />;
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value))
      return value.length > 0 ? value.join(", ") : "None";
    if (typeof value === "number") return value.toFixed(2);
    if (typeof value === "string") return value || "-";
    return String(value);
  };

  const formatPercentChange = (percentChange?: number): string => {
    if (percentChange === undefined) return "";
    const sign = percentChange > 0 ? "+" : "";
    return `${sign}${percentChange.toFixed(1)}%`;
  };

  const getChangeColorClass = (
    percentChange: number | undefined,
    _fieldName?: string,
  ): string => {
    if (percentChange === undefined || percentChange === 0) return "";

    // Standard Math: Increase (+) is Green, Decrease (-) is Red
    // We keep the TEXT color math-based (Green +, Red -) so it's consistent with the sign
    // But we will use the ICON to show Business Value
    return percentChange > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  };

  const getStatusBadgeClass = (changeType: string): string => {
    if (changeType === "added") {
      // Solid Brand Green (Emerald)
      return "bg-primary text-primary-foreground";
    }
    if (changeType === "removed") {
      // Solid Brand Red (Rose)
      return "bg-destructive text-destructive-foreground";
    }
    if (changeType === "modified") {
      // Solid Warning Amber
      return "bg-amber-500 text-white";
    }
    return "bg-slate-500 text-white";
  };

  // Enrich ingredient names
  const enrichedIngredientDiff = ingredientDiff.map((diff) => {
    const ingredient = ingredients.find((i) => i.id === diff.ingredientId);
    return {
      ...diff,
      ingredientName: ingredient?.name || `Ingredient ${diff.ingredientId}`,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-4 text-lg font-semibold">
        <span className="text-muted-foreground">Version {version1Number}</span>
        <ArrowRight className="h-5 w-5" />
        <span className="text-primary">Version {version2Number}</span>
      </div>

      {/* Recipe Fields Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Field</TableHead>
                <TableHead className="w-1/3">
                  Version {version1Number}
                </TableHead>
                <TableHead className="w-1/3">
                  Version {version2Number}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipeDiff
                .filter((diff) => diff.changeType !== "unchanged")
                .map((diff) => (
                  <TableRow key={diff.field}>
                    <TableCell className="font-medium">{diff.field}</TableCell>
                    <TableCell>{formatValue(diff.oldValue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatValue(diff.newValue)}
                        {diff.percentChange !== undefined && (
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs font-semibold ${getChangeColorClass(diff.percentChange, diff.field)}`}
                            >
                              ({formatPercentChange(diff.percentChange)})
                            </span>
                            {getImpactIcon(
                              diff.percentChange,
                              getBusinessImpact(diff.percentChange, diff.field),
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {recipeDiff.filter((d) => d.changeType !== "unchanged").length ===
            0 && (
            <p className="text-center text-muted-foreground py-4">
              No changes in recipe details
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ingredients Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Ingredient</TableHead>
                <TableHead className="w-1/4">Status</TableHead>
                <TableHead className="w-1/4">
                  Version {version1Number}
                </TableHead>
                <TableHead className="w-1/4">
                  Version {version2Number}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedIngredientDiff.map((diff) => (
                <TableRow
                  key={diff.ingredientId}
                  // className={getChangeColor(diff.changeType)} // Removed per request
                >
                  <TableCell className="font-medium">
                    {diff.ingredientName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(diff.changeType)}`}
                    >
                      {diff.changeType.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {diff.quantityChange && diff.unitChange ? (
                      <div className="text-sm">
                        {diff.quantityChange.old > 0 ? (
                          <>
                            {diff.quantityChange.old} {diff.unitChange.old}
                            {diff.costChange?.old && (
                              <span className="text-muted-foreground ml-2">
                                (${diff.costChange.old.toFixed(2)})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {diff.quantityChange && diff.unitChange ? (
                      <div className="text-sm">
                        {diff.quantityChange.new > 0 ? (
                          <>
                            {diff.quantityChange.new} {diff.unitChange.new}
                            {diff.costChange?.new && (
                              <span className="text-muted-foreground ml-2">
                                (${diff.costChange.new.toFixed(2)})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {enrichedIngredientDiff.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No ingredients to compare
            </p>
          )}
        </CardContent>
      </Card>

      {/* Legend - Detailed Status Meanings */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`${getStatusBadgeClass("added")} px-2 py-0.5 rounded-full text-[10px] font-bold`}
              >
                ADDED
              </span>
              <span className="text-muted-foreground text-xs italic">
                New field or ingredient
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`${getStatusBadgeClass("removed")} px-2 py-0.5 rounded-full text-[10px] font-bold`}
              >
                REMOVED
              </span>
              <span className="text-muted-foreground text-xs italic">
                Deleted field or ingredient
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`${getStatusBadgeClass("modified")} px-2 py-0.5 rounded-full text-[10px] font-bold`}
              >
                MODIFIED
              </span>
              <span className="text-muted-foreground text-xs italic">
                Changed value or quantity
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
