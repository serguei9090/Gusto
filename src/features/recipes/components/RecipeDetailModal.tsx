import { ChefHat, Printer, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecipeStore } from "../store/recipes.store";
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
          <div className="px-0 pb-4 print:hidden">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="mt-0 h-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Change Log</h3>
              <RecipeHistory
                recipeId={selectedRecipe.id}
                key={selectedRecipe.updatedAt}
              />
            </div>
          </TabsContent>

          <TabsContent value="overview" className="mt-0 space-y-8 h-full">
            <RecipeOverview recipe={selectedRecipe} />
          </TabsContent>
        </Tabs>
      );
    }
    return null;
  };

  if (!selectedRecipe && !isLoading) return null;

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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
