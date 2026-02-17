import {
  ChefHat,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types/ingredient.types";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";

interface Props {
  recipes: Recipe[];
}

export function RecipeMarginAuditModal({ recipes }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const auditData = useMemo(() => {
    return recipes
      .map((recipe) => {
        const cost = recipe.totalCost || 0;
        const price = recipe.sellingPrice || 0;
        const margin = price - cost;
        const marginPercent = price > 0 ? (margin / price) * 100 : 0;
        const foodCostPercent = price > 0 ? (cost / price) * 100 : 0;

        return {
          ...recipe,
          cost,
          price,
          margin,
          marginPercent,
          foodCostPercent,
        };
      })
      .sort((a, b) => b.price - a.price);
  }, [recipes]);

  const filteredAudit = useMemo(() => {
    return auditData.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [auditData, searchQuery]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-10 px-4 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all"
        >
          <Target className="h-4 w-4 text-primary" />
          Margin Sandbox
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl md:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-2xl">
        <DialogHeader className="p-6 bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                Recipe Margin Audit
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Sandbox: Comparing Theoretical Material Cost vs Defined Selling
                Prices.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes for audit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background border-muted-foreground/20 focus-visible:ring-primary rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 pt-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold">Recipe Name</TableHead>
                <TableHead className="text-right font-bold">
                  Mat. Cost
                </TableHead>
                <TableHead className="text-right font-bold">
                  Sale Price
                </TableHead>
                <TableHead className="text-right font-bold">
                  Margin ($)
                </TableHead>
                <TableHead className="text-right font-bold">
                  Food Cost %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudit.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <CurrencyDisplay amount={item.cost} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <CurrencyDisplay amount={item.price} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-bold tabular-nums",
                      item.margin >= 0 ? "text-green-600" : "text-red-500",
                    )}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {item.margin >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <CurrencyDisplay amount={item.margin} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                        item.foodCostPercent > 35
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700",
                      )}
                    >
                      {item.foodCostPercent.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAudit.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No recipes found for the audit.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 bg-muted/30 border-t text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2 justify-center">
          <Target className="h-3 w-3" />
          Theoretical financial analysis based on current recipe definitions.
        </div>
      </DialogContent>
    </Dialog>
  );
}
