import { Beaker } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExperimentBadgeProps {
  experimentName?: string;
  parentRecipeId?: number;
  className?: string;
}

export const ExperimentBadge = ({
  experimentName,
  parentRecipeId,
  className,
}: ExperimentBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1 cursor-default ${className}`}
          >
            <Beaker className="h-3 w-3" />
            <span>Experiment{experimentName ? `: ${experimentName}` : ""}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a recipe variation/experiment.</p>
          {parentRecipeId && (
            <p className="text-xs text-muted-foreground mt-1">
              Derived from Recipe #{parentRecipeId}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
