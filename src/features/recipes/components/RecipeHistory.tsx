import { format } from "date-fns";
import { Download, Eye, GitCompare, History, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIngredientsStore } from "@/features/ingredients/store/ingredients.store";
import type {
  RecipeCategory,
  RecipeWithIngredients,
  UnitOfMeasure,
} from "@/types/ingredient.types";
import { calculateSuggestedPrice } from "@/utils/costEngine";
import type { Currency } from "@/utils/currency";
import {
  type DetailedVersionDiff,
  type IngredientDiff,
  type RecipeVersion,
  recipeVersionRepository,
} from "../services/recipeVersion.repository";
import { useRecipeStore } from "../store/recipes.store";
import { RecipeOverview } from "./RecipeOverview";
import { VersionDiffView } from "./VersionDiffView";

interface RecipeHistoryProps {
  recipeId: number;
}

export const RecipeHistory = ({ recipeId }: RecipeHistoryProps) => {
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchFullRecipe } = useRecipeStore();
  const { ingredients: allIngredients, fetchIngredients } =
    useIngredientsStore();
  const [viewingVersion, setViewingVersion] = useState<RecipeVersion | null>(
    null,
  );
  const [selectedVersions, setSelectedVersions] = useState<Set<number>>(
    new Set(),
  );
  const [comparingVersions, setComparingVersions] = useState<{
    version1: number;
    version2: number;
    recipeDiff: DetailedVersionDiff[];
    ingredientDiff: IngredientDiff[];
  } | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recipeVersionRepository.getVersions(recipeId);
      setVersions(data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    loadHistory();
    if (allIngredients.length === 0) {
      fetchIngredients();
    }
  }, [loadHistory, allIngredients.length, fetchIngredients]);

  const handleRollback = async (version: RecipeVersion) => {
    if (
      !confirm(
        `Are you sure you want to rollback to version ${version.versionNumber}? Current changes will be overwritten.`,
      )
    ) {
      return;
    }

    try {
      await recipeVersionRepository.rollbackToVersion(
        recipeId,
        version.versionNumber,
      );
      await fetchFullRecipe(recipeId); // Refresh main recipe view
      await loadHistory(); // Refresh history list
    } catch (error) {
      console.error("Failed to rollback", error);
      alert("Failed to rollback to version");
    }
  };

  const handleCompare = async () => {
    const versions = Array.from(selectedVersions).sort((a, b) => a - b);
    if (versions.length !== 2) return;

    try {
      const diff = await recipeVersionRepository.compareVersionsDetailed(
        recipeId,
        versions[0],
        versions[1],
      );
      setComparingVersions({
        version1: versions[0],
        version2: versions[1],
        ...diff,
      });
      setSelectedVersions(new Set()); // Clear selection after compare
    } catch (error) {
      console.error("Failed to compare versions", error);
      alert("Failed to compare versions");
    }
  };

  const toggleVersionSelection = (versionNumber: number) => {
    setSelectedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(versionNumber)) {
        newSet.delete(versionNumber);
      } else {
        newSet.add(versionNumber);
      }
      return newSet;
    });
  };

  const handleExportCSV = async () => {
    try {
      const csv = await recipeVersionRepository.exportHistoryToCSV(recipeId);

      // Get recipe name for filename
      const recipeName = versions[0]?.name || "recipe";
      const fileName = `${recipeName.toLowerCase().replace(/\s+/g, "-")}-history.csv`;

      // Create blob and download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export history", error);
      alert("Failed to export history");
    }
  };

  const mapVersionToRecipe = (
    version: RecipeVersion,
  ): RecipeWithIngredients => {
    return {
      id: version.recipeId, // Use recipeId, not version.id (which is version primary key)
      name: version.name,
      description: version.description,
      category: version.category as RecipeCategory,
      servings: version.servings,
      prepTimeMinutes: version.prepTimeMinutes,
      cookingInstructions: version.cookingInstructions,
      sellingPrice: version.sellingPrice,
      currency: version.currency as Currency,
      targetCostPercentage: version.targetCostPercentage,
      wasteBufferPercentage: version.wasteBufferPercentage,
      totalCost: version.totalCost,
      profitMargin: version.profitMargin,
      createdAt: version.createdAt,
      updatedAt: version.createdAt,
      ingredients: version.ingredientsSnapshot.map((snap) => {
        const originalIngredient = allIngredients.find(
          (i) => i.id === snap.ingredient_id,
        );
        return {
          id: snap.id || 0, // Snapshot ID
          recipeId: version.recipeId,
          ingredientId: snap.ingredient_id,
          quantity: snap.quantity,
          unit: snap.unit,
          cost: snap.cost,
          notes: snap.notes,
          ingredientName:
            originalIngredient?.name ||
            `Unknown Ingredient (${snap.ingredient_id})`,
          currentPricePerUnit: originalIngredient?.pricePerUnit || 0,
          ingredientUnit: (originalIngredient?.unitOfMeasure ||
            "kg") as UnitOfMeasure,
          currency: originalIngredient?.currency || "USD",
        };
      }),
    };
  };

  if (loading) {
    return <div className="p-4 text-center">Loading history...</div>;
  }

  if (versions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>No history available for this recipe.</p>
      </div>
    );
  }

  const selectedCount = selectedVersions.size;

  return (
    <>
      {/* Action Buttons */}
      <div className="mb-4 flex justify-between items-center">
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>

        {selectedCount === 2 && (
          <Button onClick={handleCompare} variant="default" size="sm">
            <GitCompare className="h-4 w-4 mr-2" />
            Compare Selected
          </Button>
        )}
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {versions.map((version) => (
            <Card
              key={version.id}
              className={version.isCurrent ? "border-primary" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {/* Checkbox for comparison */}
                    <Checkbox
                      checked={selectedVersions.has(version.versionNumber)}
                      onCheckedChange={() =>
                        toggleVersionSelection(version.versionNumber)
                      }
                      disabled={
                        selectedCount === 2 &&
                        !selectedVersions.has(version.versionNumber)
                      }
                      aria-label={`Select version ${version.versionNumber}`}
                    />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        Version {version.versionNumber}
                        {version.isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(version.createdAt), "PPP p")}
                        {version.createdBy && ` by ${version.createdBy}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingVersion(version)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {!version.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRollback(version)}
                        title="Rollback to this version"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  {version.changeNotes && (
                    <div className="bg-muted p-2 rounded text-xs italic">
                      "{version.changeNotes}"
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                    <div>
                      <span className="font-semibold">Cost:</span> $
                      {version.totalCost?.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold">Margin:</span>{" "}
                      {version.profitMargin?.toFixed(1)}%
                    </div>
                    <div>
                      <span className="font-semibold">Price:</span> $
                      {version.sellingPrice ? (
                        version.sellingPrice.toFixed(2)
                      ) : (
                        <span className="italic">
                          {calculateSuggestedPrice(
                            version.totalCost || 0,
                            version.targetCostPercentage || 25,
                          ).toFixed(2)}{" "}
                          (Est.)
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Ingredients:</span>{" "}
                      {version.ingredientsSnapshot.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      {/* Version Detail Dialog */}{" "}
      <Dialog
        open={!!viewingVersion}
        onOpenChange={(open) => !open && setViewingVersion(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[200]">
          <DialogHeader>
            <DialogTitle>
              Version {viewingVersion?.versionNumber} Details
            </DialogTitle>
          </DialogHeader>
          {viewingVersion && (
            <RecipeOverview recipe={mapVersionToRecipe(viewingVersion)} />
          )}
        </DialogContent>
      </Dialog>
      {/* Version Comparison Dialog */}
      <Dialog
        open={!!comparingVersions}
        onOpenChange={(open) => !open && setComparingVersions(null)}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[200]">
          <DialogHeader>
            <DialogTitle>Version Comparison</DialogTitle>
          </DialogHeader>
          {comparingVersions && (
            <VersionDiffView
              version1Number={comparingVersions.version1}
              version2Number={comparingVersions.version2}
              recipeDiff={comparingVersions.recipeDiff}
              ingredientDiff={comparingVersions.ingredientDiff}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
