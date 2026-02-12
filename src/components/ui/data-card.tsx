import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  details?: { label: string; value: React.ReactNode; className?: string }[];
  onEdit?: () => void;
  onDelete?: () => void;
  actions?: React.ReactNode;
}

export const DataCard = ({
  title,
  subtitle,
  details,
  onEdit,
  onDelete,
  actions,
  className,
  ...props
}: DataCardProps) => {
  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-4 shadow-sm space-y-3 relative transition-all active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {actions}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {details && details.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          {details.map((detail, idx) => (
            <div
              key={`${detail.label}-${idx}`}
              className={cn("space-y-0.5", detail.className)}
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">
                {detail.label}
              </span>
              <div className="text-xs font-medium">{detail.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface DataCardListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export const DataCardList = <T,>({
  items,
  renderItem,
  emptyMessage = "No items found",
  className,
}: DataCardListProps<T>) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 py-2", className)}>
      {items.map(renderItem)}
    </div>
  );
};
