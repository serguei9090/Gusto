import type { ComponentType } from "react";
import { useMemo, useSyncExternalStore } from "react";
import { useSettingsStore } from "@/modules/core/settings/store/settings.store";

export interface DashboardWidget {
  id: string;
  component: ComponentType;
  /**
   * Optional module ID this widget belongs to.
   * If provided, the widget will be filtered based on module visibility.
   */
  moduleId?: string;
  /**
   * Grid column span (1-4). Default is 1.
   * Total grid columns is 4.
   */
  colSpan?: 1 | 2 | 3 | 4;
  order: number;
}

class WidgetRegistry {
  private readonly listeners: Set<() => void> = new Set();
  private snapshot: DashboardWidget[] = [];

  register(widget: DashboardWidget) {
    // Check if widget already exists to prevent duplicates
    if (this.snapshot.some((w) => w.id === widget.id)) {
      return;
    }

    // Create a new array reference (immutable update)
    const nextState = [...this.snapshot, widget].sort(
      (a, b) => a.order - b.order,
    );
    this.snapshot = nextState;

    this.notify();
  }

  getAll() {
    return this.snapshot;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear() {
    if (this.snapshot.length > 0) {
      this.snapshot = [];
      this.notify();
    }
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const dashboardRegistry = new WidgetRegistry();

// Stable references for useSyncExternalStore (never re-created)
const subscribeFn = (cb: () => void) => dashboardRegistry.subscribe(cb);
const getSnapshotFn = () => dashboardRegistry.getAll();

/**
 * React hook that subscribes to dashboard widget registry changes.
 * Uses `useSyncExternalStore` for correct concurrent-mode behaviour.
 */
export function useDashboardWidgets() {
  const allWidgets = useSyncExternalStore(
    subscribeFn,
    getSnapshotFn,
    getSnapshotFn, // SSR fallback
  );

  const { modules } = useSettingsStore();

  return useMemo(() => {
    return allWidgets.filter((widget) => {
      // If no moduleId is specified, always show it (it's core/global)
      if (!widget.moduleId) return true;

      // Otherwise, respect the module visibility setting
      // Default to visible (true) if not found in store
      return modules[widget.moduleId] ?? true;
    });
  }, [allWidgets, modules]);
}
