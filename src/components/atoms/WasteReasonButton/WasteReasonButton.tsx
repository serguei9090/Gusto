import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WasteReasonButtonProps {
  reason: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export const WasteReasonButton = ({
  reason,
  icon,
  selected,
  onClick,
}: WasteReasonButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "flex flex-col items-center justify-center h-24 w-full gap-2 transition-all",
        selected
          ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
          : "hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "p-2 rounded-full",
          selected ? "bg-background" : "bg-muted",
        )}
      >
        {icon}
      </div>
      <span className="font-semibold text-sm">{reason}</span>
    </Button>
  );
};
