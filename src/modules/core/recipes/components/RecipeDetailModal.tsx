import { Beaker, ChefHat, GitPullRequest, Printer } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slot } from "@/lib/slots/Slot";
import { useRecipeStore } from "../store/recipes.store";
import { ExperimentBadge } from "./ExperimentBadge";
import { RecipeHistory } from "./RecipeHistory";
import { RecipeOverview } from "./RecipeOverview";

interface RecipeDetailModalProps {
  recipeId: number;
  onClose: () => void;
}

export const RecipeDetailModal = ({
  recipeId,
  onClose,
}: RecipeDetailModalProps) => {
  const {
    selectedRecipe,
    fetchFullRecipe,
    isLoading,
    error,
    createExperiment,
    applyExperimentToParent,
  } = useRecipeStore();

  useEffect(() => {
    if (recipeId) fetchFullRecipe(recipeId);
  }, [recipeId, fetchFullRecipe]);

  const handlePrint = () => {
    globalThis.print();
  };

  const handleCreateExperiment = async () => {
    if (!selectedRecipe) return;
    const name = globalThis.prompt(
      "Enter a name for this experiment:",
      "Scale Test",
    );
    if (!name) return;

    try {
      const experiment = await createExperiment(selectedRecipe.id, name);
      alert(`Experiment "${experiment.name}" created!`);
    } catch (err) {
      console.error(err);
      alert("Failed to create experiment");
    }
  };

  const handleApplyToOriginal = async () => {
    if (!selectedRecipe?.isExperiment) return;

    if (
      !confirm(
        "Are you sure you want to apply these changes to the original recipe? This will update the parent recipe with current experiment data.",
      )
    ) {
      return;
    }

    try {
      await applyExperimentToParent(selectedRecipe.id);
      alert("Changes applied to original recipe!");
    } catch (err) {
      console.error(err);
      alert("Failed to apply changes");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          Loading details...
        </div>
      );
    }
    if (error) {
      return <div className="text-destructive p-4 text-center">{error}</div>;
    }
    if (selectedRecipe) {
      return (
        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <div className="px-0 pb-4 print:hidden px-4 md:px-0">
            <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="mt-0 h-full px-4 md:px-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Change Log</h3>
              <RecipeHistory
                recipeId={selectedRecipe.id}
                key={selectedRecipe.updatedAt}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="overview"
            className="mt-0 space-y-8 h-full px-4 md:px-0"
          >
            <RecipeOverview recipe={selectedRecipe} />
          </TabsContent>
        </Tabs>
      );
    }
    return null;
  };

  if (!selectedRecipe && !isLoading) return null;

  return (
    <Dialog open={!!recipeId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg border-x-0 sm:border p-0 sm:max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b flex flex-row items-center justify-between print:hidden sticky top-0 bg-background z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full hidden sm:block">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-semibold">
                  Recipe Detail
                </DialogTitle>
                {selectedRecipe?.isExperiment && (
                  <ExperimentBadge
                    experimentName={selectedRecipe.experimentName}
                    parentRecipeId={selectedRecipe.parentRecipeId}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedRecipe?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!selectedRecipe?.isExperiment ? (
              <Button
                variant="outline"
                onClick={handleCreateExperiment}
                size="sm"
                className="hidden sm:flex"
              >
                <Beaker className="mr-2 h-4 w-4" />
                New Experiment
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleApplyToOriginal}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 hidden sm:flex"
              >
                <GitPullRequest className="mr-2 h-4 w-4" />
                Apply to Original
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handlePrint}
              size="sm"
              className="hidden sm:flex"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-0 print:p-0 print:overflow-visible">
          {renderContent()}
        </div>

        <Slot name="recipe-detail:footer" />
      </DialogContent>
    </Dialog>
  );
};
