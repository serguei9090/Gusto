import type { LucideIcon } from "lucide-react";

export interface ModuleDefinition {
  id: string;
  title: string;
  icon: LucideIcon;
  component: React.ComponentType;
  order: number;
  isCore: boolean;
  description?: string;
}

export interface RegisteredModule extends ModuleDefinition {
  enabled: boolean;
}
