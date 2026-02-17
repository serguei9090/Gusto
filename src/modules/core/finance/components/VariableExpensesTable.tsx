import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useExpensesStore,
  type VariableExpense,
} from "../store/expenses.store";

export const VariableExpensesTable = () => {
  const {
    variableExpenses,
    loadExpenses,
    addVariableExpense,
    updateVariableExpense,
    deleteVariableExpense,
  } = useExpensesStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    type: "PercentOfSales" as "PercentOfSales" | "FixedAmount",
  });

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateVariableExpense(editingId, {
          name: formData.name,
          rate: parseFloat(formData.rate),
          type: formData.type,
        });
      } else {
        await addVariableExpense(
          formData.name,
          parseFloat(formData.rate),
          formData.type,
        );
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", rate: "", type: "PercentOfSales" });
  };

  const handleEdit = (expense: VariableExpense) => {
    setEditingId(expense.id);
    setFormData({
      name: expense.name,
      rate: expense.rate.toString(),
      type: expense.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this expense?")) {
      await deleteVariableExpense(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Variable Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Expense" : "Add Variable Expense"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Expense Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Electricity, Gas"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: "PercentOfSales" | "FixedAmount") =>
                      setFormData({ ...formData, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PercentOfSales">% of Sales</SelectItem>
                      <SelectItem value="FixedAmount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {formData.type === "PercentOfSales"
                      ? "Percentage (%)"
                      : "Amount ($)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variableExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.name}</TableCell>
                <TableCell>
                  {expense.type === "PercentOfSales"
                    ? "% of Sales"
                    : "Fixed Amount"}
                </TableCell>
                <TableCell className="text-right">
                  {expense.type === "PercentOfSales"
                    ? `${expense.rate.toFixed(2)}%`
                    : `$${expense.rate.toFixed(2)}`}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {variableExpenses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground p-4"
                >
                  No variable expenses recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
