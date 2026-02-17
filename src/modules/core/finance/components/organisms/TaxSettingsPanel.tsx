import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useFinanceStore } from "../../store/finance.store";
import type { TaxRate } from "../../types";
import { TaxRateRow } from "../molecules/TaxRateRow";

export function TaxSettingsPanel() {
  const { taxRates, fetchTaxRates, addTaxRate, updateTaxRate } =
    useFinanceStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTax, setNewTax] = useState<Partial<TaxRate>>({
    name: "",
    rate: 0.1,
    type: "VAT",
    isActive: true,
  });

  useEffect(() => {
    fetchTaxRates();
  }, [fetchTaxRates]);

  const handleAdd = async () => {
    if (!newTax.name || newTax.rate === undefined) return;
    await addTaxRate(newTax as TaxRate);
    setIsDialogOpen(false);
    setNewTax({ name: "", rate: 0.1, type: "VAT", isActive: true });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tax Configuration</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tax Rate</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={newTax.name}
                  onChange={(e) =>
                    setNewTax({ ...newTax, name: e.target.value })
                  }
                  placeholder="e.g. VAT Standard"
                />
              </div>
              <div className="grid gap-2">
                <Label>Rate (Decimal)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTax.rate}
                  onChange={(e) =>
                    setNewTax({ ...newTax, rate: parseFloat(e.target.value) })
                  }
                />
                <span className="text-xs text-muted-foreground">
                  0.10 = 10%
                </span>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={newTax.type}
                  onValueChange={(
                    v: "VAT" | "GST" | "SERVICE" | "LUXURY" | "OTHER",
                  ) => setNewTax({ ...newTax, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="SERVICE">Service Charge</SelectItem>
                    <SelectItem value="LUXURY">Luxury Tax</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd}>Save Tax Rate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {taxRates.map((tax) => (
          <TaxRateRow
            key={tax.id}
            tax={tax}
            onEdit={() => {}} // TODO: Implement Edit
            onDelete={() => updateTaxRate(tax.id, { isActive: false })} // Archive
            onToggle={(id, active) => updateTaxRate(id, { isActive: active })}
          />
        ))}
      </CardContent>
    </Card>
  );
}
