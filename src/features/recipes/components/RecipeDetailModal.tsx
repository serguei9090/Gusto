import { ChefHat, Clock, Printer, Users, X } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useRecipeStore } from "../store/recipes.store";

interface RecipeDetailModalProps {
  recipeId: number;
  onClose: () => void;
}

export const RecipeDetailModal = ({
  recipeId,
  onClose,
}: RecipeDetailModalProps) => {
  const { selectedRecipe, fetchFullRecipe, isLoading, error } =
    useRecipeStore();

  useEffect(() => {
    if (recipeId) fetchFullRecipe(recipeId);
  }, [recipeId, fetchFullRecipe]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handlePrint = () => {
    globalThis.print();
  };

  if (!selectedRecipe && !isLoading) return null;

  const costPerServing = selectedRecipe?.totalCost
    ? selectedRecipe.totalCost / selectedRecipe.servings
    : 0;

  return (
    // We render a manual overlay/modal structure similar to what we did in the Page to ensure full control,
    // or we could use the Dialog component. Let's use a custom overlay to match the previous behavior
    // and ensure it handles the specific print layout well, or just use the Dialog primitive.
    // For simplicity and consistency with the "Dialog" pattern but with custom print styles:
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
      <div className="w-full max-w-4xl bg-card border rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col print:border-0 print:shadow-none print:max-h-none print:w-full print:max-w-none">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Recipe Detail</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print Cost Sheet
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 print:p-0 print:overflow-visible">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              Loading details...
            </div>
          ) : error ? (
            <div className="text-destructive p-4 text-center">{error}</div>
          ) : selectedRecipe ? (
            <div className="space-y-8" id="printable-recipe">
              {/* Recipe Header Info */}
              <div className="space-y-4">
                <div>
                  <Badge
                    variant="outline"
                    className="mb-2 print:text-black print:border-black"
                  >
                    {selectedRecipe.category || "Uncategorized"}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {selectedRecipe.name}
                  </h1>
                </div>

                <div className="flex gap-6 text-muted-foreground print:text-black">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Yield:{" "}
                      <span className="font-medium text-foreground print:text-black">
                        {selectedRecipe.servings} servings
                      </span>
                    </span>
                  </div>
                  {selectedRecipe.prepTimeMinutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Prep Time:{" "}
                        <span className="font-medium text-foreground print:text-black">
                          {selectedRecipe.prepTimeMinutes} mins
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {selectedRecipe.description && (
                  <p className="text-muted-foreground print:text-black">
                    {selectedRecipe.description}
                  </p>
                )}
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
                      ${selectedRecipe.sellingPrice?.toFixed(2) || "0.00"}
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={
                    (selectedRecipe.profitMargin || 0) < 20
                      ? "border-destructive/50 bg-destructive/10"
                      : (selectedRecipe.profitMargin || 0) < 30
                        ? "border-yellow-500/50 bg-yellow-500/10"
                        : "border-green-500/50 bg-green-500/10"
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground">
                      Profit Margin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${(selectedRecipe.profitMargin || 0) < 20
                        ? "text-destructive"
                        : (selectedRecipe.profitMargin || 0) < 30
                          ? "text-yellow-700 dark:text-yellow-500"
                          : "text-green-700 dark:text-green-500"
                        }`}
                    >
                      {selectedRecipe.profitMargin?.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
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
                      {selectedRecipe.ingredients.map((ing) => (
                        <TableRow
                          key={ing.id}
                          className="print:border-b-gray-200"
                        >
                          <TableCell className="font-medium">
                            {ing.ingredientName}
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
                      {(selectedRecipe.wasteBufferPercentage || 0) > 0 && (
                        <>
                          <TableRow>
                            <TableCell colSpan={3}>Subtotal</TableCell>
                            <TableCell className="text-right">
                              $
                              {(
                                (selectedRecipe.totalCost || 0) /
                                (1 + (selectedRecipe.wasteBufferPercentage || 0) / 100)
                              ).toFixed(2)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="text-orange-600">
                            <TableCell colSpan={3}>
                              Waste Buffer ({selectedRecipe.wasteBufferPercentage}%)
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              +$
                              {(
                                ((selectedRecipe.totalCost || 0) * (selectedRecipe.wasteBufferPercentage || 0)) /
                                (100 + (selectedRecipe.wasteBufferPercentage || 0))
                              ).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">Total Batch Cost</TableCell>
                        <TableCell className="text-right font-black text-lg">
                          ${selectedRecipe.totalCost?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>

              {/* Cooking Instructions */}
              {selectedRecipe.cookingInstructions && (
                <div className="space-y-4 break-before-page">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Cooking Instructions
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground print:text-black whitespace-pre-line">
                    {selectedRecipe.cookingInstructions}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
