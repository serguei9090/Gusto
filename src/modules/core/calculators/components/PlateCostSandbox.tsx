import { Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SmartNumericInput } from "./SmartNumericInput";
import { UnitSelect } from "./UnitSelect";

interface SandboxItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export const PlateCostSandbox = () => {
  const [items, setItems] = useState<SandboxItem[]>([
    {
      id: "1",
      name: "Chicken Breast",
      quantity: 200,
      unit: "g",
      pricePerUnit: 0.01,
    },
    {
      id: "2",
      name: "Potatoes",
      quantity: 150,
      unit: "g",
      pricePerUnit: 0.002,
    },
  ]);
  const [wasteBuffer, setWasteBuffer] = useState<number>(5);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(2, 11),
        name: "",
        quantity: 0,
        unit: "g",
        pricePerUnit: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof SandboxItem,
    value: string | number,
  ) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const totalIngredientsCost = items.reduce(
    (acc, item) => acc + item.quantity * item.pricePerUnit,
    0,
  );
  const wasteValue = (totalIngredientsCost * wasteBuffer) / 100;
  const grandTotal = totalIngredientsCost + wasteValue;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Plate Costing Sandbox</CardTitle>
        <CardDescription>
          Prototype new recipes and estimate costs immediately without adding
          items to the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40%]">Ingredient Name</TableHead>
                <TableHead className="w-[100px]">Qty</TableHead>
                <TableHead className="w-[120px]">Unit</TableHead>
                <TableHead className="w-[120px]">Price/Unit</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      className="border-none shadow-none focus-visible:ring-0 px-0 h-8"
                      value={item.name}
                      placeholder="Chicken, Butter, etc."
                      onChange={(e) =>
                        updateItem(item.id, "name", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <SmartNumericInput
                      value={item.quantity}
                      className="h-8"
                      onChange={(val) => updateItem(item.id, "quantity", val)}
                    />
                  </TableCell>
                  <TableCell>
                    <UnitSelect
                      value={item.unit}
                      onValueChange={(val) => updateItem(item.id, "unit", val)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <SmartNumericInput
                      value={item.pricePerUnit}
                      className="h-8"
                      onChange={(val) =>
                        updateItem(item.id, "pricePerUnit", val)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${(item.quantity * item.pricePerUnit).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive h-8 w-8 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Add ingredients to start costing your plate.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile DataCard View */}
        <div className="md:hidden">
          <DataCardList
            items={items}
            emptyMessage="No ingredients added. Tap 'Add Ingredient' to start."
            renderItem={(item) => (
              <DataCard
                key={item.id}
                title={item.name || "New Ingredient"}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive h-8 w-8 -mr-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
                details={[
                  {
                    label: "Name",
                    value: (
                      <Input
                        className="h-8 text-sm"
                        value={item.name}
                        placeholder="Ingredient Name"
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                      />
                    ),
                    className: "col-span-2 pb-2",
                  },
                  {
                    label: "Quantity",
                    value: (
                      <div className="flex gap-2">
                        <SmartNumericInput
                          value={item.quantity}
                          className="h-8 flex-1"
                          onChange={(val) =>
                            updateItem(item.id, "quantity", val)
                          }
                        />
                        <UnitSelect
                          value={item.unit}
                          onValueChange={(val) =>
                            updateItem(item.id, "unit", val)
                          }
                          className="h-8 w-[70px]"
                        />
                      </div>
                    ),
                    className: "col-span-2",
                  },
                  {
                    label: "Price / Unit",
                    value: (
                      <SmartNumericInput
                        value={item.pricePerUnit}
                        className="h-8"
                        onChange={(val) =>
                          updateItem(item.id, "pricePerUnit", val)
                        }
                      />
                    ),
                  },
                  {
                    label: "Total Cost",
                    value: (
                      <div className="h-8 flex items-center font-mono font-bold">
                        ${(item.quantity * item.pricePerUnit).toFixed(2)}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          />
        </div>

        <div className="flex justify-between items-center text-sm pt-2">
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" /> Add Ingredient
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Waste Buffer:</span>
            <SmartNumericInput
              value={wasteBuffer}
              className="w-16 h-8"
              onChange={setWasteBuffer}
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              Subtotal
            </span>
            <div className="text-xl font-bold">
              ${totalIngredientsCost.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              Waste Impact
            </span>
            <div className="text-xl font-bold text-orange-600">
              +${wasteValue.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-xs text-primary uppercase font-bold">
              Total Plate Cost
            </span>
            <div className="text-3xl font-extrabold text-primary">
              ${grandTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 text-xs text-muted-foreground p-3 flex gap-2">
        <Info className="h-3 w-3" />
        This is a sandbox. Items here are NOT saved or linked to your inventory.
      </CardFooter>
    </Card>
  );
};
