import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  decimals?: number;
  className?: string;
  highlightFunction?: (val: number) => string; // conditional styling
}

export function CurrencyDisplay({
  amount,
  currency = "USD",
  decimals = 2,
  className,
}: CurrencyDisplayProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn("font-mono tracking-tight tabular-nums", className)}>
      {formatter.format(amount)}
    </span>
  );
}
