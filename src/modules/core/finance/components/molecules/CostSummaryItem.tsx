import { CurrencyDisplay } from "../atoms/CurrencyDisplay";
import { TrendIndicator } from "../atoms/TrendIndicator";

interface CostSummaryItemProps {
  label: string;
  value: number;
  previousValue?: number;
  isTotal?: boolean;
  isPrimary?: boolean;
  currency?: string;
}

export function CostSummaryItem({
  label,
  value,
  previousValue = 0,
  isTotal,
  isPrimary,
  currency = "USD",
}: CostSummaryItemProps) {
  return (
    <div className="flex justify-between items-end py-1">
      <span className={isTotal ? "font-bold" : "text-sm text-muted-foreground"}>
        {label}
      </span>
      <div className="text-right">
        <div
          className={
            isTotal
              ? isPrimary
                ? "text-xl font-bold text-primary"
                : "text-lg font-bold"
              : "font-medium"
          }
        >
          <CurrencyDisplay amount={value} currency={currency} />
        </div>
        {previousValue > 0 && (
          <div className="flex justify-end">
            <TrendIndicator
              current={value}
              previous={previousValue}
              inverse={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
