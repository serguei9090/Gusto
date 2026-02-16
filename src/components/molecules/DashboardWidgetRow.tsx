import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface DashboardWidgetRowProps {
  widget: { id: string; name?: string };
  visible: boolean;
  onToggle: (visible: boolean) => void;
}

export const DashboardWidgetRow = ({
  widget,
  visible,
  onToggle,
}: DashboardWidgetRowProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-card border border-border rounded-md mb-2 last:mb-0",
        !visible && "opacity-60 bg-muted/30",
      )}
    >
      <span className="font-medium text-sm">
        {widget.name || `Widget ${widget.id}`}
      </span>
      <Switch checked={visible} onCheckedChange={onToggle} />
    </div>
  );
};
