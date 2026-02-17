import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRecipeStore } from "../../../recipes/store/recipes.store";
import { useIncomeStore } from "../../store/income.store";

import { AdvancedIncomeForm } from "../organisms/AdvancedIncomeForm";

export function IncomeTab() {
  const { entries, loadIncome, deleteIncome } = useIncomeStore();
  const { fetchRecipes } = useRecipeStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadIncome();
    fetchRecipes();
  }, [loadIncome, fetchRecipes]);

  const handleDelete = async (id: number) => {
    if (confirm("Delete this entry?")) {
      await deleteIncome(id);
    }
  };

  const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Income & Sales</h3>
          <p className="text-sm text-muted-foreground">
            Record actual revenue to compare against theoretical costs.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-xl shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Record Sales
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-xl p-0 overflow-hidden rounded-2xl border-none">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold">
                Record Sales Entry
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-2">
              <AdvancedIncomeForm
                onSuccess={() => setIsDialogOpen(false)}
                onCancel={() => setIsDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <div className="text-sm font-medium text-muted-foreground">
          Total Recorded Income
        </div>
        <div className="text-3xl font-bold text-primary">
          ${totalIncome.toFixed(2)}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right font-medium">
                  ${entry.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground p-4"
                >
                  No income entries recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
