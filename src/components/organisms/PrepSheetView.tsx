import { Printer, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PrepSheet } from "@/modules/core/prep-sheets/types";

interface PrepSheetRecipe {
  id: number;
  recipeName: string;
  requestedServings: number;
  recipeId: number;
}

interface PrepSheetViewProps {
  readonly sheet: PrepSheet;
  readonly onClose: () => void;
  readonly onSave?: () => void;
  readonly showSaveButton?: boolean;
}

export function PrepSheetView({
  sheet,
  onClose,
  onSave,
  showSaveButton,
}: PrepSheetViewProps) {
  const handlePrint = () => {
    globalThis.print();
  };

  return (
    <Dialog open={!!sheet} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] translate-x-0 translate-y-0 sm:h-auto sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-lg border-x-0 sm:border p-0 sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col h-full">
          <DialogHeader className="border-b p-6 sticky top-0 bg-background z-20 px-4 pt-4 sm:p-6 sm:static">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <DialogTitle className="text-2xl truncate">
                  {sheet.name}
                </DialogTitle>
                <DialogDescription className="truncate">
                  {new Date(sheet.date).toLocaleDateString()}
                  {sheet.shift &&
                    ` • ${sheet.shift.charAt(0).toUpperCase() + sheet.shift.slice(1)} Shift`}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 print:hidden shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="hidden sm:flex"
                >
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                {showSaveButton && onSave && (
                  <Button size="sm" onClick={onSave} className="h-9 sm:h-9">
                    <Save className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-32 sm:pb-8">
            {/* Recipes Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Planned Production</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {(sheet.recipes as unknown as PrepSheetRecipe[]).map(
                  (recipe) => (
                    <div
                      key={recipe.recipeId}
                      className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border"
                    >
                      <span className="font-medium truncate mr-2">
                        {recipe.recipeName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 font-bold whitespace-nowrap"
                      >
                        {recipe.requestedServings} servings
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </div>

            <Separator />

            {/* Ingredients Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Ingredient Prep List
              </h3>
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4 min-w-[140px] sm:pl-0 sm:w-[40%]">
                        Ingredient
                      </TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Usage Breakdown
                      </TableHead>
                      <TableHead className="w-[50px] text-right pr-4">
                        Check
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheet.items.map((item) => (
                      <TableRow key={item.ingredientId}>
                        <TableCell className="font-medium pl-4 sm:pl-4">
                          {item.ingredientName}
                          <div className="sm:hidden text-[10px] text-muted-foreground mt-0.5 leading-tight">
                            {item.recipeBreakdown
                              .map((b) => b.recipeName)
                              .join(", ")}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-bold">
                          {item.totalQuantity.toFixed(2)} {item.unit}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          <ul className="list-disc list-inside">
                            {item.recipeBreakdown.map((breakdown) => (
                              <li key={breakdown.recipeName}>
                                {breakdown.recipeName}:{" "}
                                {breakdown.qty.toFixed(2)} {item.unit}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <input
                            type="checkbox"
                            className="h-6 w-6 rounded-md border-gray-300 accent-primary"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {sheet.notes && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-amber-900">
                <h4 className="font-semibold text-xs uppercase mb-2 opacity-70 tracking-wider">
                  Notes
                </h4>
                <p className="text-sm leading-relaxed">{sheet.notes}</p>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background z-30 border-t glass-footer flex gap-3 pb-safe sm:hidden">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-semibold"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-5 w-5" /> Print
            </Button>
            <Button
              className="flex-1 h-12 text-base font-semibold"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
