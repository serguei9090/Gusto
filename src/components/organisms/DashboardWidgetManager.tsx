import { useEffect, useState } from "react";
import { DashboardWidgetRow } from "@/components/molecules/DashboardWidgetRow";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useAllDashboardWidgets } from "@/modules/core/dashboard/registry";
import { useDashboardConfigStore } from "@/modules/core/dashboard/store/dashboard-config.store";

interface DashboardWidgetManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DashboardWidgetManager = ({
  open,
  onOpenChange,
}: DashboardWidgetManagerProps) => {
  const allWidgets = useAllDashboardWidgets();
  const { preferences, setWidgetVisibility } = useDashboardConfigStore();

  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Sync internal order state with store/registry when opening
  useEffect(() => {
    if (open && allWidgets.length > 0) {
      // Create a list of IDs sorted by current preference
      const sortedIds = [...allWidgets]
        .sort((a, b) => {
          const orderA = preferences[a.id]?.order ?? a.order ?? 999;
          const orderB = preferences[b.id]?.order ?? b.order ?? 999;
          return orderA - orderB;
        })
        .map((w) => w.id);
      setOrderedIds(sortedIds);
    }
  }, [open, allWidgets, preferences]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle>Manage Widgets</SheetTitle>
          <SheetDescription>
            Toggle visibility of dashboard widgets.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 pr-2 -mr-2">
          {orderedIds.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No widgets available to manage.
            </div>
          ) : (
            <div className="space-y-2">
              {orderedIds.map((id) => {
                const widget = allWidgets.find((w) => w.id === id);
                if (!widget) return null;

                const isVisible = preferences[id]?.visible ?? true;

                return (
                  <DashboardWidgetRow
                    key={id}
                    widget={{ id, name: id }} // TODO: Add friendly names to registry
                    visible={isVisible}
                    onToggle={(val) => setWidgetVisibility(id, val)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t mt-auto">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
