import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { useRegistry } from "@/lib/modules/registry";
import { useSettingsStore } from "../store/settings.store";

export const ModulesSection = () => {
  const { t } = useTranslation();
  const { modules, moduleOrder, toggleModule, reorderModules } =
    useSettingsStore();
  const reg = useRegistry();

  // Build unified list: stored order first, then any newly-discovered modules
  // from the registry that aren't yet in the store (e.g. a Pro module just loaded).
  // This mirrors the Sidebar's discovery pattern.
  const allModules = reg.getAll();

  const displayOrder = useMemo(() => {
    // Start with the stored order (excluding "settings" which has its own section)
    const stored = moduleOrder.filter((id) => id !== "settings");

    // Discover modules registered at runtime but not yet in the store
    const discovered = allModules
      .filter(
        (m) =>
          m.id !== "settings" &&
          !stored.some((s) => s.toLowerCase() === m.id.toLowerCase()),
      )
      .map((m) => m.id.toLowerCase());

    return [...stored, ...discovered];
  }, [moduleOrder, allModules]);

  // Helper: resolve module metadata (icon, label, isCore) from the registry
  const getModuleMeta = (moduleId: string) => {
    const mod = reg.get(moduleId);
    const tKey = `navigation.${moduleId}`;
    const translated = t(tKey);
    return {
      label: translated === tKey ? (mod?.title ?? moduleId) : translated,
      icon: mod?.icon,
      isCore: mod?.isCore ?? true,
      description: mod?.description,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.modules.title")}</CardTitle>
        <CardDescription>{t("settings.modules.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          {t("settings.modules.dragToReorder")}
        </div>
        <Reorder.Group
          axis="y"
          values={displayOrder}
          onReorder={reorderModules}
          className="space-y-2"
        >
          {displayOrder.map((moduleId) => {
            const meta = getModuleMeta(moduleId);
            const Icon = meta.icon;

            return (
              <Reorder.Item
                key={moduleId}
                value={moduleId}
                className={`flex items-center justify-between p-3 bg-card border rounded-md cursor-move hover:bg-muted/50 transition-colors ${
                  !meta.isCore ? "border-primary/30" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  {Icon && (
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`module-${moduleId}`}
                        className="cursor-pointer font-medium"
                      >
                        {meta.label}
                      </Label>
                      {!meta.isCore && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-primary/50 text-primary font-bold"
                        >
                          PRO
                        </Badge>
                      )}
                    </div>
                    {meta.description && (
                      <span className="text-xs text-muted-foreground">
                        {meta.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {(modules[moduleId] ?? true)
                      ? t("settings.modules.visible")
                      : t("settings.modules.hidden")}
                  </span>
                  <Switch
                    id={`module-${moduleId}`}
                    checked={modules[moduleId] ?? true}
                    onCheckedChange={(checked) =>
                      toggleModule(moduleId, checked)
                    }
                  />
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </CardContent>
    </Card>
  );
};
