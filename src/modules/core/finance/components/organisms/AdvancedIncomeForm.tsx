import { format } from "date-fns";
import { CalendarIcon, LayoutList, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types/ingredient.types";
import { useRecipeStore } from "../../../recipes/store/recipes.store";
import { useIncomeStore } from "../../store/income.store";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";
import { RecipeSearchInput } from "../molecules/RecipeSearchInput";
import { SalesEntryRow } from "../molecules/SalesEntryRow";

interface RecipeSale {
  id: string; // Internal unique ID for the form state
  recipeId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdvancedIncomeForm({ onSuccess, onCancel }: Props) {
  const { recipes, isLoading: recipesLoading } = useRecipeStore();
  const { addIncome, isLoading: incomeLoading } = useIncomeStore();

  const isLoading = recipesLoading || incomeLoading;

  const [date, setDate] = useState<Date>(new Date());
  const [generalIncome, setGeneralIncome] = useState({
    amount: "",
    description: "General Sales",
  });
  const [recipeSales, setRecipeSales] = useState<RecipeSale[]>([]);

  const handleAddRecipe = (recipe: Recipe) => {
    console.log(
      "Adding recipe to sales:",
      recipe.name,
      "Detected Price:",
      recipe.sellingPrice,
    );

    // Coerce to number and handle null/undefined/string/0
    const rawPrice = recipe.sellingPrice;
    const defaultPrice =
      rawPrice !== null && rawPrice !== undefined ? Number(rawPrice) : 0;

    const newSale: RecipeSale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipeId: recipe.id,
      name: recipe.name,
      unitPrice: Number.isNaN(defaultPrice) ? 0 : defaultPrice,
      quantity: 1,
    };
    setRecipeSales((prev) => [...prev, newSale]);
  };

  const updateRecipeSale = (id: string, updates: Partial<RecipeSale>) => {
    setRecipeSales(
      recipeSales.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const removeRecipeSale = (id: string) => {
    setRecipeSales(recipeSales.filter((s) => s.id !== id));
  };

  const total = useMemo(() => {
    const general = parseFloat(generalIncome.amount) || 0;
    const recipesTotal = recipeSales.reduce(
      (sum, s) => sum + s.unitPrice * s.quantity,
      0,
    );
    return general + recipesTotal;
  }, [generalIncome.amount, recipeSales]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateStr = format(date, "yyyy-MM-dd");

      // 1. Save General Income if amount > 0
      if (parseFloat(generalIncome.amount) > 0) {
        await addIncome(
          dateStr,
          parseFloat(generalIncome.amount),
          generalIncome.description,
          "General",
        );
      }

      // 2. Save each Recipe Sale
      for (const sale of recipeSales) {
        if (sale.quantity > 0 && sale.unitPrice * sale.quantity > 0) {
          await addIncome(
            dateStr,
            sale.unitPrice * sale.quantity,
            `Sales: ${sale.name}`,
            "Recipe",
            sale.recipeId,
            sale.quantity,
          );
        }
      }

      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pr-2"
    >
      {/* Header / Date */}
      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
          Date of Sales
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal h-12 rounded-xl",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <Accordion
          type="multiple"
          defaultValue={["recipe-sales"]}
          className="w-full"
        >
          <AccordionItem
            value="general-revenue"
            className="border-none bg-primary/5 rounded-xl px-4 transition-all"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  General Revenue
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={generalIncome.amount}
                      onChange={(e) =>
                        setGeneralIncome({
                          ...generalIncome,
                          amount: e.target.value,
                        })
                      }
                      className="pl-7 h-12 text-base rounded-lg border-primary/20 focus-visible:ring-primary shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Optional Description
                  </Label>
                  <Input
                    placeholder="e.g. Tips, Other Income..."
                    value={generalIncome.description}
                    onChange={(e) =>
                      setGeneralIncome({
                        ...generalIncome,
                        description: e.target.value,
                      })
                    }
                    className="h-10 text-sm rounded-lg"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <Separator className="my-2 opacity-50" />

          <AccordionItem value="recipe-sales" className="border-none px-1">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Dish/Recipe Sales
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-0 space-y-4">
              <RecipeSearchInput
                recipes={recipes}
                onSelect={handleAddRecipe}
                selectedIds={recipeSales.map((s) => s.recipeId)}
              />

              {recipes.length === 0 && !recipesLoading && (
                <div className="px-2 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                  Warning: No recipes found in system. Create recipes first.
                </div>
              )}
              {recipesLoading && (
                <div className="px-2 py-2 text-xs text-muted-foreground animate-pulse">
                  Loading recipes...
                </div>
              )}

              <div className="space-y-3">
                {recipeSales.map((sale) => (
                  <SalesEntryRow
                    key={sale.id}
                    recipeName={sale.name}
                    unitPrice={sale.unitPrice}
                    quantity={sale.quantity}
                    onUpdate={(updates) => updateRecipeSale(sale.id, updates)}
                    onRemove={() => removeRecipeSale(sale.id)}
                  />
                ))}
                {recipeSales.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-xl bg-muted/5">
                    <p className="text-sm">No dishes added yet.</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sticky/Footer Total */}
      <div className="pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t mt-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-medium text-muted-foreground uppercase">
            Total Record
          </span>
          <span className="text-2xl font-black text-primary">
            <CurrencyDisplay amount={total} />
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={total <= 0 || isLoading}
            className="flex-1 h-12 rounded-xl font-bold text-base"
          >
            {isLoading ? "Saving..." : "Save All entries"}
          </Button>
        </div>
      </div>
    </form>
  );
}
