import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  current: number;
  previous: number;
  inverse?: boolean; // If true, up is bad (e.g. costs)
  className?: string;
}

export function TrendIndicator({
  current,
  previous,
  inverse = false,
  className,
}: TrendIndicatorProps) {
  if (previous === 0) return null;

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isZero = Math.abs(percentage) < 0.01;

  if (isZero) {
    return (
      <span
        className={cn(
          "inline-flex items-center text-muted-foreground text-xs",
          className,
        )}
      >
        <Minus className="h-3 w-3 mr-1" />
        0%
      </span>
    );
  }

  const isPositive = diff > 0;
  // If inverse is true (costs), positive diff is bad (red), negative is good (green).
  // If inverse is false (profit), positive diff is good (green), negative is bad (red).
  const isGood = inverse ? !isPositive : isPositive;

  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium",
        isGood ? "text-emerald-600" : "text-red-600",
        className,
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {Math.abs(percentage).toFixed(1)}%
    </span>
  );
}
