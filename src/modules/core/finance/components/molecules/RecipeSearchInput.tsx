import { Check, ChefHat, ChevronRight, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types/ingredient.types";

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  selectedIds?: number[];
}

export function RecipeSearchInput({
  recipes,
  onSelect,
  selectedIds = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Recipes to Add
        </span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {selectedIds.length} Added
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-14 px-4 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 group text-base sm:text-sm"
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground group-hover:text-foreground">
                Tap to search & add recipes...
              </span>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[85vh]">
          <DialogHeader className="p-4 bg-primary/5 border-b">
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Select Recipe
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-muted/20 border-transparent focus-visible:ring-primary rounded-xl"
                autoFocus
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearch("")}
                  className="absolute right-1 top-1 h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredRecipes.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto opacity-20 mb-2" />
                  No recipe found matches "{search}"
                </div>
              ) : (
                filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => {
                      console.log("Adding recipe via Dialog:", recipe.name);
                      onSelect(recipe);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-4 text-left rounded-xl transition-all",
                      "hover:bg-primary/5 active:scale-[0.98]",
                      selectedIds.includes(recipe.id)
                        ? "bg-primary/10 text-primary border-transparent"
                        : "text-foreground",
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-base">{recipe.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {recipe.category && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {recipe.category}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-primary/80">
                          Selling: ${recipe.sellingPrice || 0}
                        </span>
                      </div>
                    </div>
                    {selectedIds.includes(recipe.id) ? (
                      <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="border border-muted-foreground/20 rounded-full p-1.5 bg-background">
                        <Plus className="h-3.5 w-3.5 opacity-40 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-muted/20 border-t flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-medium">
              {filteredRecipes.length} recipes showing
            </span>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
