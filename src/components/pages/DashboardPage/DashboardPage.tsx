import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { ArrowRightLeft, Check, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { SortableWidgetWrapper } from "@/components/molecules/SortableWidgetWrapper";
import { DashboardWidgetManager } from "@/components/organisms/DashboardWidgetManager";
import { Button } from "@/components/ui/button";

import { Slot } from "@/lib/slots/Slot";
import { useDashboardWidgets } from "@/modules/core/dashboard/registry";
import { useDashboardStore } from "@/modules/core/dashboard/store/dashboard.store";
import { useDashboardConfigStore } from "@/modules/core/dashboard/store/dashboard-config.store";
import { useCurrencyStore } from "@/modules/core/settings/store/currency.store";

export const DashboardPage = () => {
  const widgets = useDashboardWidgets();
  const { fetchDashboardData, error, isLoading } = useDashboardStore();

  // Wait for currency store to finish loading before fetching dashboard data
  const { currencies, baseCurrency: storeCurrency } = useCurrencyStore();
  const currenciesLoaded = currencies.length > 0 || storeCurrency !== "USD";

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run when currencies finish loading
  useEffect(() => {
    // Only fetch dashboard data after currencies have loaded
    if (currenciesLoaded) {
      fetchDashboardData();
    }
  }, [currenciesLoaded]); // Re-fetch when currencies finish loading

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isRearranging, setIsRearranging] = useState(false);
  const { setWidgetOrder } = useDashboardConfigStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts to prevent accidental clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(widgets, oldIndex, newIndex).map(
          (w) => w.id,
        );
        // Optimistically update the store
        setWidgetOrder(newOrder);
      }
    }
  };

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="p-8 text-muted-foreground">Loading dashboard...</div>
    );
  }

  return (
    <div className="flex-1 space-y-6 md:space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant={isRearranging ? "secondary" : "outline"}
            onClick={() => setIsRearranging(!isRearranging)}
            className={isRearranging ? "bg-accent text-accent-foreground" : ""}
          >
            {isRearranging ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Done Rearranging
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Rearrange
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsCustomizeOpen(true)}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Manage Widgets
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {widgets.map((widget) => {
              const Component = widget.component;

              // Mobile always takes 1 col, desktop respects colSpan
              const colSpanMap: Record<number, string> = {
                1: "col-span-1",
                2: "lg:col-span-2 md:col-span-2 col-span-1",
                3: "lg:col-span-3 md:col-span-2 col-span-1",
                4: "lg:col-span-4 md:col-span-2 col-span-1",
              };
              const colSpanClass =
                colSpanMap[widget.colSpan || 1] || "col-span-1";

              return (
                <SortableWidgetWrapper
                  key={widget.id}
                  id={widget.id}
                  isRearranging={isRearranging}
                  className={`${colSpanClass} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  <Component />
                </SortableWidgetWrapper>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4">
        <Slot name="dashboard:after" />
      </div>

      <DashboardWidgetManager
        open={isCustomizeOpen}
        onOpenChange={setIsCustomizeOpen}
      />
    </div>
  );
};
