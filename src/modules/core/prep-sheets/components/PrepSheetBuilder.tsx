import {
  Check,
  ChevronsUpDown,
  Plus,
  Search,
  Trash2,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { usePrepSheetsStore } from "@/modules/core/prep-sheets/store/prep-sheets.store";
import type { PrepSheetFormData } from "@/modules/core/prep-sheets/types";
import { useRecipeStore } from "@/modules/core/recipes/store/recipes.store";

interface PrepSheetBuilderProps {
  onGenerate: (data: PrepSheetFormData) => void;
  isLoading?: boolean;
}

export function PrepSheetBuilder({
  onGenerate,
  isLoading,
}: Readonly<PrepSheetBuilderProps>) {
  const {
    builderSelections,
    builderFields,
    addRecipeToBuilder,
    updateBuilderServings,
    removeRecipeFromBuilder,
    setBuilderField,
  } = usePrepSheetsStore();

  const { recipes, fetchRecipes } = useRecipeStore();

  const { name, date, shift, prepCookName, notes } = builderFields;
  const [recipeSearch, setRecipeSearch] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) =>
      r.name.toLowerCase().includes(recipeSearch.toLowerCase()),
    );
  }, [recipes, recipeSearch]);

  const toggleRecipe = (recipeId: number, baseServings: number) => {
    const isSelected = builderSelections.some((s) => s.recipeId === recipeId);
    if (isSelected) {
      removeRecipeFromBuilder(recipeId);
    } else {
      addRecipeToBuilder(recipeId, baseServings);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Derived state for the table
  const selectedRecipesData = useMemo(() => {
    return builderSelections.map((selection) => {
      const recipe = recipes.find((r) => r.id === selection.recipeId);
      return {
        ...selection,
        name: recipe?.name || "Unknown Recipe",
        baseServings: recipe?.servings || 1,
      };
    });
  }, [builderSelections, recipes]);

  const handleSubmit = () => {
    onGenerate({
      name,
      date,
      shift: shift || null,
      prepCookName,
      notes,
      recipeSelections: builderSelections,
    });
  };

  const isValid = name && date && builderSelections.length > 0;

  return (
    <div className="space-y-6 pb-32 sm:pb-0">
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="px-0 pb-2 sm:px-6 sm:pb-6">
          <CardTitle>Prep Sheet Details</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Sheet Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Monday Morning Prep"
                value={name}
                onChange={(e) => setBuilderField("name", e.target.value)}
                className="h-12 text-base sm:h-10 sm:text-sm"
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setBuilderField("date", e.target.value)}
                  className="h-12 text-base sm:h-10 sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={shift}
                  onValueChange={(val: string) =>
                    setBuilderField("shift", val as "morning" | "evening")
                  }
                >
                  <SelectTrigger id="shift" className="h-12 sm:h-10">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cook">Prep Cook</Label>
              <Input
                id="cook"
                placeholder="Assigned to..."
                value={prepCookName}
                onChange={(e) =>
                  setBuilderField("prepCookName", e.target.value)
                }
                className="h-12 text-base sm:h-10 sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setBuilderField("notes", e.target.value)}
                rows={3}
                className="text-base sm:text-sm min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recipes to Prep
          </Label>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {builderSelections.length} Selected
          </span>
        </div>

        {/* Modern Searchable Dropdown Trigger */}
        <Button
          variant="outline"
          onClick={() => setIsSelectorOpen(true)}
          className="w-full justify-between h-14 px-4 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 group text-base sm:text-sm"
        >
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground group-hover:text-foreground">
              Tap to search & add recipes...
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Selected Recipes List */}
        <div className="space-y-3">
          {builderSelections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-dashed border-2 rounded-xl bg-muted/5">
              <p className="text-sm">No recipes selected. Tap above to add.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-0">
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipe Name</TableHead>
                      <TableHead className="w-[150px]">Prep Servings</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRecipesData.map((item) => (
                      <TableRow key={item.recipeId}>
                        <TableCell className="font-medium">
                          {item.name}
                          <span className="text-xs text-muted-foreground block">
                            Base: {item.baseServings} servings
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.servings}
                            onChange={(e) =>
                              updateBuilderServings(
                                item.recipeId,
                                Number.parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeRecipeFromBuilder(item.recipeId)
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="sm:hidden space-y-3">
                {selectedRecipesData.map((item) => (
                  <div
                    key={item.recipeId}
                    className="p-4 bg-background rounded-xl border shadow-sm flex items-center justify-between gap-4 animate-in fade-in slide-in-from-right-4 duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-base">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-tight">
                        Base: {item.baseServings} units
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                          Qty
                        </span>
                        <Input
                          type="number"
                          min="1"
                          value={item.servings}
                          onChange={(e) =>
                            updateBuilderServings(
                              item.recipeId,
                              Number.parseInt(e.target.value, 10) || 0,
                            )
                          }
                          className="w-16 h-12 text-center font-black text-lg bg-muted/30 border-none"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipeFromBuilder(item.recipeId)}
                        className="text-destructive/50 hover:text-destructive/100 h-12 w-12"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl z-30 border-t glass-footer pb-safe sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:flex sm:justify-end sm:pt-8">
        <Button
          size="lg"
          onClick={() => handleSubmit()}
          disabled={!isValid || isLoading}
          className="w-full h-12 text-base font-bold shadow-lg rounded-xl mb-4 sm:mb-0 sm:w-auto sm:h-10 sm:text-base sm:rounded-md sm:shadow-none sm:px-8"
        >
          {isLoading ? (
            "Generating..."
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> Generate Prep
              Sheet
            </>
          )}
        </Button>
      </div>

      {/* Modern Searchable Selection Dialog */}
      <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
        <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 rounded-none border-x-0 p-0 flex flex-col sm:max-w-[500px] sm:h-[600px] sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-y-1/2 sm:-translate-x-1/2 sm:rounded-lg sm:border">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Search Recipes</DialogTitle>
          </DialogHeader>

          <div className="p-4 border-b bg-muted/30 sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Try 'Salsa' or 'Dough'..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="pl-10 h-12 text-lg border-none bg-background rounded-xl focus-visible:ring-2 shadow-sm"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filteredRecipes.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">
                    No recipes found matching "{recipeSearch}"
                  </p>
                </div>
              ) : (
                filteredRecipes.map((recipe) => {
                  const isSelected = builderSelections.some(
                    (s) => s.recipeId === recipe.id,
                  );
                  return (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => toggleRecipe(recipe.id, recipe.servings)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg scale-[0.98]"
                          : "hover:bg-accent active:scale-95"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-base">
                          {recipe.name}
                        </p>
                        <p
                          className={`text-xs uppercase tracking-widest ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          Base: {recipe.servings} units
                        </p>
                      </div>
                      <div
                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-white border-white text-primary scale-110"
                            : "border-muted-foreground/20"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Plus className="h-5 w-5 opacity-40" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-muted/20 border-t flex justify-between items-center">
            <span className="text-sm font-medium">
              {builderSelections.length} recipes added
            </span>
            <Button
              onClick={() => setIsSelectorOpen(false)}
              size="sm"
              className="rounded-full px-6"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
