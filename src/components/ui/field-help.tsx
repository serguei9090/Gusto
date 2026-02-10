import { HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface FieldHelpProps {
  readonly helpText: string;
  readonly className?: string;
  readonly side?: "top" | "right" | "bottom" | "left";
}

/**
 * Modern help icon with tooltip for form fields
 *
 * Features:
 * - Hover to show (desktop)
 * - Click to toggle
 * - Click outside or ESC to hide
 * - Smart mounting delay to prevent auto-showing on dialog open
 *
 * Usage:
 * ```tsx
 * <FieldHelp helpText={t("ingredients.help.nameField")} />
 * ```
 */
export const FieldHelp = ({
  helpText,
  className,
  side = "right",
}: FieldHelpProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isMountingRef = useRef(true);

  // Allow Radix to take control after a short delay to prevent auto-showing on dialog open
  useEffect(() => {
    const timer = setTimeout(() => {
      isMountingRef.current = false;
    }, 500); // 500ms grace period

    return () => clearTimeout(timer);
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    // Ignore open changes during mounting grace period
    if (isMountingRef.current) {
      return;
    }
    setOpen(newOpen);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center",
              "h-4 w-4 rounded-full",
              "text-muted-foreground hover:text-foreground",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "cursor-help",
              className,
            )}
            aria-label={t("common.actions.help")}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[300px]">
          <p className="text-sm">{helpText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
