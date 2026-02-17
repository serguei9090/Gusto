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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type LaborRate, useLaborRatesStore } from "../store/laborRates.store";

export const LaborRatesSettings = () => {
  const { rates, loadRates, addRate, updateRate, deleteRate } =
    useLaborRatesStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<LaborRate | null>(null);
  const [formData, setFormData] = useState({ name: "", hourly_rate: "" });

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRate) {
        await updateRate(editingRate.id, {
          name: formData.name,
          hourly_rate: parseFloat(formData.hourly_rate),
        });
      } else {
        await addRate(formData.name, parseFloat(formData.hourly_rate));
      }
      setIsDialogOpen(false);
      setEditingRate(null);
      setFormData({ name: "", hourly_rate: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (rate: LaborRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      hourly_rate: rate.hourly_rate.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this labor rate?")) {
      await deleteRate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Labor Roles & Rates</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingRate(null);
                setFormData({ name: "", hourly_rate: "" });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRate ? "Edit Labor Role" : "Add New Labor Role"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Head Chef"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourly_rate: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
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
              <TableHead>Role Name</TableHead>
              <TableHead className="text-right">Hourly Rate</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">{rate.name}</TableCell>
                <TableCell className="text-right">
                  ${rate.hourly_rate.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(rate)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(rate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rates.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground p-4"
                >
                  No labor rates defined. Add a role to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
