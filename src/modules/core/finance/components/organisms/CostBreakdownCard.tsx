import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CostBreakdown } from "../../types";
import { CostSummaryItem } from "../molecules/CostSummaryItem";

interface CostBreakdownCardProps {
  breakdown: CostBreakdown;
  currency?: string;
}

export function CostBreakdownCard({
  breakdown,
  currency = "USD",
}: CostBreakdownCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <CostSummaryItem
            label="Raw Materials"
            value={breakdown.raw_materials}
            currency={currency}
          />
          <CostSummaryItem
            label="Direct Labor"
            value={breakdown.direct_labor}
            currency={currency}
          />
          <CostSummaryItem
            label="Labor Taxes"
            value={breakdown.labor_taxes}
            currency={currency}
          />
          <Separator className="my-2" />
          <CostSummaryItem
            label="Prime Cost"
            value={breakdown.prime_cost}
            isTotal
            currency={currency}
          />
        </div>

        <div className="space-y-1 pt-4">
          <CostSummaryItem
            label="Variable Overhead"
            value={breakdown.variable_overhead}
            currency={currency}
          />
          <CostSummaryItem
            label="Fixed Overhead"
            value={breakdown.fixed_overhead}
            currency={currency}
          />
          <Separator className="my-2" />
          <CostSummaryItem
            label="Fully Loaded Cost"
            value={breakdown.fully_loaded_cost}
            isTotal
            isPrimary // Visual emphasis
            currency={currency}
          />
        </div>
      </CardContent>
    </Card>
  );
}
