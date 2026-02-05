import { Printer, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PrepSheet } from "@/features/prep-sheets/types";

interface PrepSheetViewProps {
  sheet: PrepSheet;
  onClose: () => void;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export function PrepSheetView({
  sheet,
  onClose,
  onSave,
  showSaveButton,
}: PrepSheetViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto shadow-xl print:shadow-none print:max-w-none print:max-h-none print:border-none">
        <CardHeader className="flex flex-row items-center justify-between border-b print:border-none">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">{sheet.name}</CardTitle>
            <CardDescription>
              {new Date(sheet.date).toLocaleDateString()}
              {sheet.shift &&
                ` • ${sheet.shift.charAt(0).toUpperCase() + sheet.shift.slice(1)} Shift`}
              {sheet.prepCookName && ` • Cook: ${sheet.prepCookName}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            {showSaveButton && onSave && (
              <Button size="sm" onClick={onSave}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 print:p-0">
          {/* Recipes Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Planned Production</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
              {sheet.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex justify-between items-center bg-muted/30 p-3 rounded-md border print:border-gray-200"
                >
                  <span className="font-medium">{recipe.recipeName}</span>
                  <Badge variant="outline">
                    {recipe.requestedServings} servings
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ingredients Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ingredient Prep List</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Ingredient</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Usage Breakdown</TableHead>
                  <TableHead className="w-[50px] print:hidden">Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheet.items.map((item) => (
                  <TableRow key={item.ingredientId}>
                    <TableCell className="font-medium">
                      {item.ingredientName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-bold">
                      {item.totalQuantity.toFixed(2)} {item.unit}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <ul className="list-disc list-inside">
                        {item.recipeBreakdown.map((breakdown) => (
                          <li key={breakdown.recipeName}>
                            {breakdown.recipeName}: {breakdown.qty.toFixed(2)}{" "}
                            {item.unit}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="print:hidden">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sheet.notes && (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 text-yellow-800 print:bg-transparent print:border-gray-200 print:text-black">
              <h4 className="font-semibold text-sm uppercase mb-1 opacity-75">
                Notes
              </h4>
              <p>{sheet.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
