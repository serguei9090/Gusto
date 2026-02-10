import type { LucideIcon } from "lucide-react";

export interface ModuleDefinition {
  id: string;
  title: string;
  icon: LucideIcon;
  component: React.ComponentType;
  order: number;
  isCore: boolean;
  description?: string;
  /**
   * Optional initialization logic (e.g. loading stores).
   * Called by the registry when the app starts.
   */
  init?: () => Promise<void>;
  /**
   * Optional feature flag required to enable this module.
   * If provided, the module will only be active if the flag is true.
   */
  requiredFeature?: string;
}

export interface RegisteredModule extends ModuleDefinition {
  enabled: boolean;
}
