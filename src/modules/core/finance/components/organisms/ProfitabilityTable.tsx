import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";

export function ProfitabilityTable() {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipe</TableHead>
            <TableHead className="text-right">Sales Price</TableHead>
            <TableHead className="text-right">True Cost</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Example Recipe</TableCell>
            <TableCell className="text-right">
              <CurrencyDisplay amount={25.0} />
            </TableCell>
            <TableCell className="text-right">
              <CurrencyDisplay amount={12.5} />
            </TableCell>
            <TableCell className="text-right text-emerald-600">50%</TableCell>
          </TableRow>
          {/* TODO: Connect to Recipes Data */}
        </TableBody>
      </Table>
    </div>
  );
}
