import { Edit3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Ingredient } from "@/features/inventory/types";

interface InventoryTableProps {
    ingredients: Ingredient[];
    onRecordTransaction: (ingredient: Ingredient) => void;
}

export function InventoryTable({ ingredients, onRecordTransaction }: InventoryTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ingredients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No ingredients found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        ingredients.map((ingredient) => {
                            const isLow =
                                ingredient.minStockLevel !== null &&
                                ingredient.currentStock <= ingredient.minStockLevel;

                            return (
                                <TableRow key={ingredient.id}>
                                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                                    <TableCell className="capitalize">{ingredient.category}</TableCell>
                                    <TableCell>
                                        <span className={isLow ? "text-destructive font-medium" : ""}>
                                            {ingredient.currentStock} {ingredient.unitOfMeasure}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {ingredient.minStockLevel
                                            ? `${ingredient.minStockLevel} ${ingredient.unitOfMeasure}`
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {isLow ? (
                                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Low Stock
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">In Stock</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRecordTransaction(ingredient)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            <span className="sr-only">Update</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
