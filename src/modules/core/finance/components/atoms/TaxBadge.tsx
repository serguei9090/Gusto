import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaxRate } from "../../types";

interface TaxBadgeProps {
  type: TaxRate["type"];
  className?: string;
  showIcon?: boolean;
}

const TAX_STYLES: Record<
  TaxRate["type"],
  { label: string; className: string }
> = {
  VAT: {
    label: "VAT",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  GST: {
    label: "GST",
    className:
      "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200",
  },
  SERVICE: {
    label: "Service",
    className:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  },
  LUXURY: {
    label: "Luxury",
    className:
      "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
  },
  OTHER: {
    label: "Other",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  },
};

export function TaxBadge({ type, className }: TaxBadgeProps) {
  const style = TAX_STYLES[type] || TAX_STYLES.OTHER;

  return (
    <Badge
      variant="outline"
      className={cn(style.className, "font-mono text-xs uppercase", className)}
    >
      {style.label}
    </Badge>
  );
}
