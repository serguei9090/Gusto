import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { logger } from "@/utils/logger";

/**
 * Base state shape that all module stores must implement.
 * Provides a consistent contract for loading/error state.
 */
export interface BaseModuleState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Options for creating a module store.
 */
interface CreateModuleStoreOptions {
  /** Module name used for devtools label and logging. */
  name: string;
  /** Enable zustand devtools integration (default: true in dev). */
  devtools?: boolean;
}

/**
 * Store plugin that receives state changes and can react to them.
 * Plugins are notified AFTER state changes are applied.
 */
export interface StorePlugin<T> {
  /** Unique identifier for the plugin. */
  id: string;
  /** Called when the store is created. */
  onInit?: (api: {
    getState: () => T;
    subscribe: (listener: (state: T) => void) => () => void;
  }) => void;
  /** Called after any state change. */
  onStateChange?: (newState: T, prevState: T) => void;
}

/**
 * Creates a Zustand store with standardized middleware:
 * - Devtools integration (with module name label)
 * - Logging middleware
 * - Plugin system for extensibility
 *
 * @example
 * ```ts
 * const useMyStore = createModuleStore<MyState>(
 *   { name: "my-module" },
 *   (set, get) => ({
 *     isLoading: false,
 *     error: null,
 *     items: [],
 *     fetchItems: async () => {
 *       set({ isLoading: true, error: null });
 *       try {
 *         const items = await repo.getAll();
 *         set({ items, isLoading: false });
 *       } catch (err) {
 *         set({ error: String(err), isLoading: false });
 *       }
 *     },
 *   }),
 * );
 *
 * // Add a plugin later (e.g., from a Pro module)
 * useMyStore.addPlugin({
 *   id: "analytics",
 *   onStateChange: (state) => {
 *     if (!state.isLoading) trackEvent("items_loaded", { count: state.items.length });
 *   },
 * });
 * ```
 */
export function createModuleStore<T extends BaseModuleState>(
  options: CreateModuleStoreOptions,
  stateCreator: StateCreator<T, [], []>,
) {
  const { name } = options;
  const enableDevtools = options.devtools ?? import.meta.env.DEV;
  const plugins: StorePlugin<T>[] = [];

  // Wrap the state creator with logging middleware
  const withLogging: StateCreator<T, [], []> = (set, get, api) => {
    const loggingSet: typeof set = (...args) => {
      const prevState = get();
      // biome-ignore lint/suspicious/noExplicitAny: Zustand's set overloads make this necessary
      (set as any)(...args);
      const nextState = get();

      // Notify plugins
      for (const plugin of plugins) {
        try {
          plugin.onStateChange?.(nextState, prevState);
        } catch (err) {
          logger.error(`Plugin "${plugin.id}" error in store "${name}":`, err);
        }
      }
    };

    return stateCreator(loggingSet, get, api);
  };

  // Apply devtools middleware conditionally
  const finalCreator = enableDevtools
    ? devtools(withLogging, { name: `Gusto:${name}` })
    : withLogging;

  // biome-ignore lint/suspicious/noExplicitAny: Zustand middleware layering types
  const store = create<T>(finalCreator as any);

  /**
   * Register a plugin to extend this store's behavior.
   * Plugins can react to state changes without modifying the core store logic.
   */
  const addPlugin = (plugin: StorePlugin<T>) => {
    // Prevent duplicate plugin registration
    if (plugins.some((p) => p.id === plugin.id)) {
      logger.warn(
        `Plugin "${plugin.id}" already registered on store "${name}". Skipping.`,
      );
      return;
    }
    plugins.push(plugin);
    plugin.onInit?.({
      getState: store.getState,
      subscribe: (listener) =>
        store.subscribe((state) => {
          listener(state);
        }),
    });
    logger.debug(`Plugin "${plugin.id}" registered on store "${name}".`);
  };

  /**
   * Remove a plugin by its ID.
   */
  const removePlugin = (pluginId: string) => {
    const index = plugins.findIndex((p) => p.id === pluginId);
    if (index !== -1) {
      plugins.splice(index, 1);
      logger.debug(`Plugin "${pluginId}" removed from store "${name}".`);
    }
  };

  // Attach plugin methods to the store hook
  const storeWithPlugins = Object.assign(store, {
    addPlugin,
    removePlugin,
    /** Get list of registered plugin IDs (for debugging). */
    getPluginIds: () => plugins.map((p) => p.id),
  });

  return storeWithPlugins;
}
