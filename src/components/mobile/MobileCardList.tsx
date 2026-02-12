import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileComponent } from "@/lib/mobile-registry";

// biome-ignore lint/suspicious/noExplicitAny: proxy component
export const MobileCard = (props: any) => {
  const Component = useMobileComponent("MobileCard");

  if (Component) return <Component {...props} />;

  // Basic fallback for Core
  return (
    <div className="p-4 rounded-xl border bg-card shadow-sm space-y-3 relative group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="font-bold text-base">{props.title}</div>
          {props.subtitle && (
            <div className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full inline-block">
              {props.subtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {props.actions}
          {props.onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                props.onEdit();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {props.onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/70 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                props.onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {props.details && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed">
          {/* biome-ignore lint/suspicious/noExplicitAny: generic details */}
          {props.details.map((d: any) => (
            <div key={d.label} className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                {d.label}
              </span>
              <span className="text-sm font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// biome-ignore lint/suspicious/noExplicitAny: proxy component
export const MobileCardList = <_T,>(props: any) => {
  const Component = useMobileComponent("MobileCardList");

  if (Component) return <Component {...props} />;

  // Basic fallback for Core
  if (!props.items?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {props.emptyMessage || "No items found"}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* biome-ignore lint/suspicious/noExplicitAny: generic list mapping */}
      {props.items.map((item: any) => props.renderItem(item))}
    </div>
  );
};
