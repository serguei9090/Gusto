import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "default" | "success" | "warning" | "error" | "info";

interface StatusBadgeProps {
  label: string;
  type?: StatusType;
  icon?: LucideIcon;
  className?: string;
  variant?: "solid" | "subtle" | "outline";
}

const variantMap: Record<StatusType, string> = {
  default: "bg-secondary text-secondary-foreground border-transparent",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const solidMap: Record<StatusType, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-600 text-white",
  error: "bg-destructive text-destructive-foreground",
  info: "bg-blue-600 text-white",
};

export const StatusBadge = ({
  label,
  type = "default",
  icon: Icon,
  className,
  variant = "subtle",
}: StatusBadgeProps) => {
  const variantClasses =
    variant === "solid"
      ? solidMap[type]
      : variant === "outline"
        ? `bg-transparent border ${variantMap[type].split(" ").slice(1).join(" ")}`
        : variantMap[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1",
        variantClasses,
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
};
