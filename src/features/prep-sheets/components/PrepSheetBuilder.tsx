import { Plus, Trash2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { usePrepSheetsStore } from "@/features/prep-sheets/store/prep-sheets.store";
import type { PrepSheetFormData } from "@/features/prep-sheets/types";
import { useRecipeStore } from "@/features/recipes/store/recipes.store";

interface PrepSheetBuilderProps {
  onGenerate: (data: PrepSheetFormData) => void;
  isLoading?: boolean;
}

export function PrepSheetBuilder({
  onGenerate,
  isLoading,
}: PrepSheetBuilderProps) {
  const {
    builderSelections,
    addRecipeToBuilder,
    updateBuilderServings,
    removeRecipeFromBuilder,
  } = usePrepSheetsStore();

  const { recipes, fetchRecipes } = useRecipeStore();

  // Local form state
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<"morning" | "evening" | "">("");
  const [prepCookName, setPrepCookName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedRecipeToAdd, setSelectedRecipeToAdd] = useState("");

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

  const handleAddRecipe = () => {
    if (!selectedRecipeToAdd) return;
    const recipeId = parseInt(selectedRecipeToAdd);
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      addRecipeToBuilder(recipe.id, recipe.servings); // Default to base servings
      setSelectedRecipeToAdd("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prep Sheet Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Sheet Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Monday Morning Prep"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={shift}
                  // biome-ignore lint/suspicious/noExplicitAny: Select value type
                  onValueChange={(val: any) => setShift(val)}
                >
                  <SelectTrigger id="shift">
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
                onChange={(e) => setPrepCookName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recipes to Prep</CardTitle>
          <div className="flex gap-2">
            <Select
              value={selectedRecipeToAdd}
              onValueChange={setSelectedRecipeToAdd}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select recipe..." />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id.toString()}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddRecipe} disabled={!selectedRecipeToAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {builderSelections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-md">
              No recipes selected yet. Add recipes to generate a prep list.
            </div>
          ) : (
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
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipeFromBuilder(item.recipeId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Separator className="my-6" />

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate Prep Sheet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
