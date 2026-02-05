import { Edit2, Trash2, Eye } from "lucide-react";
import type { Recipe } from "@/types/ingredient.types";
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

interface RecipeTableProps {
    recipes: Recipe[];
    onEdit: (recipe: Recipe) => void;
    onDelete: (id: number) => void;
    onView: (recipe: Recipe) => void;
}

export const RecipeTable = ({ recipes, onEdit, onDelete, onView }: RecipeTableProps) => {
    const formatCurrency = (val: number | null) => {
        if (val === null || val === undefined) return "-";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const formatPercent = (val: number | null) => {
        if (val === null || val === undefined) return "-";
        return `${val.toFixed(1)}%`;
    };

    const getMarginBadgeVariant = (val: number | null) => {
        if (val === null || val === undefined) return "secondary";
        if (val < 20) return "destructive";
        if (val < 30) return "outline"; // Warning/Yellow not standard in shadcn badge, use outline or custom
        return "default"; // Green/Primary
    };

    // Custom color helper for margin text if not using Badge
    const getMarginColor = (val: number | null) => {
        if (val === null || val === undefined) return "text-muted-foreground";
        if (val < 20) return "text-destructive font-medium";
        if (val < 30) return "text-yellow-600 font-medium";
        return "text-green-600 font-medium";
    };

    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg bg-card">
                <p>No recipes found. Create one to get started.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Servings</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recipes.map((recipe) => (
                        <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{recipe.name}</TableCell>
                            <TableCell className="capitalize">{recipe.category || "-"}</TableCell>
                            <TableCell>{recipe.servings}</TableCell>
                            <TableCell>{formatCurrency(recipe.totalCost)}</TableCell>
                            <TableCell>{formatCurrency(recipe.sellingPrice)}</TableCell>
                            <TableCell>
                                <span className={getMarginColor(recipe.profitMargin)}>
                                    {formatPercent(recipe.profitMargin)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onView(recipe)}
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(recipe)}
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        onClick={() => onDelete(recipe.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
