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
    <Card className="border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <CardTitle>{t("settings.modules.title")}</CardTitle>
        <CardDescription>{t("settings.modules.description")}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 space-y-6">
        <div className="text-sm text-muted-foreground mb-4 italic">
          {t("settings.modules.dragToReorder")}
        </div>
        <Reorder.Group
          axis="y"
          values={displayOrder}
          onReorder={reorderModules}
          className="space-y-3"
        >
          {displayOrder.map((moduleId) => {
            const meta = getModuleMeta(moduleId);
            const Icon = meta.icon;

            return (
              <Reorder.Item
                key={moduleId}
                value={moduleId}
                className={`flex items-center justify-between p-4 bg-card border rounded-xl cursor-move hover:bg-muted/50 transition-colors shadow-sm active:scale-[0.98] ${
                  !meta.isCore ? "border-primary/30" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground opacity-50" />
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${meta.isCore ? "bg-muted" : "bg-primary/10"}`}
                  >
                    {Icon && (
                      <Icon
                        className={`h-5 w-5 ${meta.isCore ? "text-muted-foreground" : "text-primary"}`}
                      />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`module-${moduleId}`}
                        className="cursor-pointer font-bold text-base truncate"
                      >
                        {meta.label}
                      </Label>
                      {meta.isCore ? null : (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-primary/50 text-primary font-black shrink-0"
                        >
                          PRO
                        </Badge>
                      )}
                    </div>
                    {meta.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {meta.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="hidden sm:inline text-xs text-muted-foreground uppercase tracking-tighter font-bold">
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
                    className="min-h-0 scale-125 sm:scale-110"
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
