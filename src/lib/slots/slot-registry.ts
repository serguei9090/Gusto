import type { ComponentType } from "react";
import { useCallback, useSyncExternalStore } from "react";

/** Stable empty array reference for slots with no entries */
const EMPTY_ENTRIES: SlotEntry[] = [];

// ─── Types ───────────────────────────────────────────────────────────

/**
 * A single UI contribution injected into a named slot.
 * Generic `P` allows typed props to flow through.
 */
export interface SlotEntry<P = Record<string, unknown>> {
  /** Unique ID for this contribution (prevents duplicates) */
  id: string;
  /** The React component to render */
  component: ComponentType<P>;
  /** Render order within the slot (lower = earlier) */
  order: number;
}

// ─── Registry ────────────────────────────────────────────────────────

/**
 * Global slot registry.
 *
 * **Core pages** define named slots (e.g. `"ingredient-form:after-fields"`).
 * **Pro modules** inject components into those slots via `slotRegistry.register(...)`.
 *
 * @example
 * // In a Pro module's init():
 * slotRegistry.register("ingredient-form:after-fields", {
 *   id: "pro-nutrition-panel",
 *   component: NutritionPanel,
 *   order: 10,
 * });
 *
 * // In the Core IngredientForm:
 * <Slot name="ingredient-form:after-fields" />
 */
class SlotRegistryImpl {
  /** slot-name → sorted entries */
  private readonly slots: Map<string, SlotEntry[]> = new Map();
  private readonly listeners: Set<() => void> = new Set();
  /** Incremented on every mutation – used as snapshot identity */
  private version = 0;

  // ── Mutations ──────────────────────────────────────────────────

  /**
   * Register a component into a named slot.
   * Idempotent: duplicate `entry.id` within the same slot is ignored.
   */
  register<P = Record<string, never>>(
    slotName: string,
    entry: SlotEntry<P>,
  ): void {
    const existing = this.slots.get(slotName) ?? [];
    if (existing.some((e) => e.id === entry.id)) return;

    // Cast is safe — we erase the generic at storage level
    existing.push(entry as unknown as SlotEntry);
    existing.sort((a, b) => a.order - b.order);
    this.slots.set(slotName, existing);

    this.version++;
    this.notify();
  }

  /**
   * Remove a component from a named slot by entry ID.
   */
  unregister(slotName: string, entryId: string): void {
    const existing = this.slots.get(slotName);
    if (!existing) return;

    const filtered = existing.filter((e) => e.id !== entryId);
    if (filtered.length === existing.length) return; // nothing changed

    this.slots.set(slotName, filtered);
    this.version++;
    this.notify();
  }

  /**
   * Clear all entries for a given slot.
   */
  clearSlot(slotName: string): void {
    if (!this.slots.has(slotName)) return;
    this.slots.delete(slotName);
    this.version++;
    this.notify();
  }

  // ── Reads ──────────────────────────────────────────────────────

  /**
   * Get all entries for a given slot name (sorted by order).
   */
  getEntries(slotName: string): SlotEntry[] {
    return this.slots.get(slotName) ?? EMPTY_ENTRIES;
  }

  /**
   * Returns the current version number (acts as snapshot identity).
   */
  getVersion(): number {
    return this.version;
  }

  // ── Subscription (useSyncExternalStore contract) ───────────────

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

// Singleton
export const slotRegistry = new SlotRegistryImpl();

// Stable subscribe reference for useSyncExternalStore (never re-created)
const subscribeFn = (cb: () => void) => slotRegistry.subscribe(cb);

// ─── React Hook ──────────────────────────────────────────────────────

/**
 * Subscribe to a named slot and re-render when entries change.
 * Uses `useSyncExternalStore` for correct concurrent-mode behaviour.
 *
 * @param slotName - The slot to subscribe to
 * @returns The current list of `SlotEntry` items for that slot
 */
export function useSlot(slotName: string): SlotEntry[] {
  const getSnapshot = useCallback(
    () => slotRegistry.getEntries(slotName),
    [slotName],
  );
  const entries = useSyncExternalStore(
    subscribeFn,
    getSnapshot,
    getSnapshot, // SSR fallback (same)
  );
  return entries;
}
