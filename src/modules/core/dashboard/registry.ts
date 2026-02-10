import type { ComponentType } from "react";

export interface DashboardWidget {
  id: string;
  component: ComponentType;
  /**
   * Grid column span (1-4). Default is 1.
   * Total grid columns is 4.
   */
  colSpan?: 1 | 2 | 3 | 4;
  order: number;
}

import { useEffect, useState } from "react";

class WidgetRegistry {
  private widgets: DashboardWidget[] = [];
  private listeners: Set<() => void> = new Set();

  register(widget: DashboardWidget) {
    if (this.widgets.some((w) => w.id === widget.id)) {
      return;
    }
    this.widgets.push(widget);
    this.widgets.sort((a, b) => a.order - b.order);
    this.notify();
  }

  getAll() {
    return this.widgets;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear() {
    this.widgets = [];
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const dashboardRegistry = new WidgetRegistry();

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState(dashboardRegistry.getAll());

  useEffect(() => {
    return dashboardRegistry.subscribe(() => {
      setWidgets([...dashboardRegistry.getAll()]);
    });
  }, []);

  return widgets;
}
