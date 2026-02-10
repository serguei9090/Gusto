import type { ComponentType } from "react";
import { useSyncExternalStore } from "react";

export interface SettingsSection {
  /** Unique identifier for this settings section */
  id: string;
  /** Display title for the section header */
  title: string;
  /** Optional description shown under the title */
  description?: string;
  /** The component to render for this section */
  component: ComponentType;
  /**
   * Rendering order (lower = earlier).
   * Core sections use 10-50, modules should use 100+.
   */
  order: number;
  /**
   * Whether this section belongs to the core settings.
   * Used for visual grouping (core sections render first).
   */
  isCore?: boolean;
}

class SettingsRegistry {
  private sections: SettingsSection[] = [];
  private readonly listeners: Set<() => void> = new Set();

  register(section: SettingsSection) {
    // Prevent duplicate registration
    if (this.sections.some((s) => s.id === section.id)) {
      return;
    }
    this.sections.push(section);
    this.sections.sort((a, b) => a.order - b.order);
    this.notify();
  }

  unregister(id: string) {
    this.sections = this.sections.filter((s) => s.id !== id);
    this.notify();
  }

  getAll(): SettingsSection[] {
    return this.sections;
  }

  getCore(): SettingsSection[] {
    return this.sections.filter((s) => s.isCore);
  }

  getExtensions(): SettingsSection[] {
    return this.sections.filter((s) => !s.isCore);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear() {
    this.sections = [];
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const settingsRegistry = new SettingsRegistry();

// Stable references for useSyncExternalStore (never re-created)
const subscribeFn = (cb: () => void) => settingsRegistry.subscribe(cb);
const getSnapshotFn = () => settingsRegistry.getAll();

/**
 * React hook that subscribes to settings registry changes.
 * Uses `useSyncExternalStore` for correct concurrent-mode behaviour.
 * Returns the current list of registered settings sections.
 */
export function useSettingsSections() {
  return useSyncExternalStore(
    subscribeFn,
    getSnapshotFn,
    getSnapshotFn, // SSR fallback
  );
}
