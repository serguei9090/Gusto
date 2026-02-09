import type { ModuleDefinition } from "@/types/module";

class ModuleRegistry {
  private static instance: ModuleRegistry;
  private readonly modules: Map<string, ModuleDefinition> = new Map();
  private readonly listeners: Set<() => void> = new Set();

  private constructor() {}

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Register a new module.
   */
  public register(module: ModuleDefinition): void {
    const id = module.id.toLowerCase();
    if (this.modules.has(id)) {
      console.warn(
        `Module with id "${id}" is already registered. Overwriting.`,
      );
    }
    this.modules.set(id, module);
    this.notify();
  }

  /**
   * Get a module by ID.
   */
  public get(id: string): ModuleDefinition | undefined {
    return this.modules.get(id.toLowerCase());
  }

  /**
   * Get all registered modules.
   */
  public getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Subscribe to changes in the registry.
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      l();
    });
  }
  // ... rest of the helper methods

  /**
   * Get all core modules.
   */
  public getCoreModules(): ModuleDefinition[] {
    return this.getAll().filter((m) => m.isCore);
  }

  /**
   * Get all pro modules.
   */
  public getProModules(): ModuleDefinition[] {
    return this.getAll().filter((m) => !m.isCore);
  }
}

import { useEffect, useState } from "react";

export const registry = ModuleRegistry.getInstance();

// Hook to subscribe to registry changes
export function useRegistry() {
  const [_tick, setTick] = useState(0);

  useEffect(() => {
    return registry.subscribe(() => setTick((t) => t + 1));
  }, []);

  return registry;
}
