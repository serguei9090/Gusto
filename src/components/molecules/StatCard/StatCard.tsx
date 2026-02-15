import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  className?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isUpward: boolean;
  };
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  description,
  className,
  onClick,
  trend,
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        "group transition-all duration-200",
        onClick && "cursor-pointer hover:bg-muted/50 active:scale-[0.98]",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <div className="text-xl sm:text-2xl font-bold tracking-tight">
            {value}
          </div>
          {(description || trend) && (
            <div className="flex items-center text-[10px] sm:text-xs">
              {trend && (
                <span
                  className={cn(
                    "mr-1.5 font-medium",
                    trend.isUpward ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {trend.isUpward ? "+" : "-"}
                  {trend.value}%
                </span>
              )}
              {description && (
                <span className="text-muted-foreground line-clamp-1">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
