import type { ComponentType } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useSettingsStore } from "@/modules/core/settings/store/settings.store";
import { useDashboardConfigStore } from "./store/dashboard-config.store";

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

  const { preferences, initWidgetPreferences } = useDashboardConfigStore();

  // Initialize preferences for new widgets
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run when widgets change
  useEffect(() => {
    if (allWidgets.length > 0) {
      initWidgetPreferences(
        allWidgets.map((w) => ({ id: w.id, order: w.order })),
      );
    }
  }, [allWidgets.length]);

  return useMemo(() => {
    return allWidgets
      .filter((widget) => {
        // 1. Module Visibility
        if (widget.moduleId && !modules[widget.moduleId]) return false;

        // 2. User Preference Visibility
        const pref = preferences[widget.id];
        if (pref && !pref.visible) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by user preference order, falling back to default order
        const orderA = preferences[a.id]?.order ?? a.order;
        const orderB = preferences[b.id]?.order ?? b.order;
        return orderA - orderB;
      });
  }, [allWidgets, modules, preferences]);
}

// Export a hook to get ALL widgets (including hidden ones) for the manager
export function useAllDashboardWidgets() {
  const allWidgets = useSyncExternalStore(
    subscribeFn,
    getSnapshotFn,
    getSnapshotFn,
  );
  return allWidgets;
}
