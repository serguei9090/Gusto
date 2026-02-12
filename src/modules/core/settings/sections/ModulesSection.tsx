import { Reorder } from "framer-motion";
import { GripVertical, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { useRegistry } from "@/lib/modules/registry";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "../store/settings.store";

export const ModulesSection = () => {
  const { t } = useTranslation();
  const { modules, moduleOrder, toggleModule, reorderModules } =
    useSettingsStore();
  const reg = useRegistry();
  const [isOpen, setIsOpen] = useState(false);

  // Build unified list: stored order first, then any newly-discovered modules
  // from the registry that aren't yet in the store (e.g. a Pro module just loaded).
  // This mirrors the Sidebar's discovery pattern.
  const allModules = reg.getAll();

  const displayOrder = useMemo(() => {
    // Start with the stored order (excluding "settings" which has its own section)
    // AND filter against currently registered modules to avoid showing "ghost" Pro modules in Core mode
    const stored = moduleOrder.filter((id) => {
      if (id === "settings") return false;
      return allModules.some((m) => m.id.toLowerCase() === id.toLowerCase());
    });

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

  const enabledCount = displayOrder.filter((id) => modules[id] ?? true).length;

  return (
    <Card className="border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{t("settings.modules.title")}</CardTitle>
            <CardDescription>
              {t("settings.modules.description")}
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("settings.modules.manage")}
                </span>
                <span className="inline sm:hidden">
                  {t("common.actions.edit")}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] flex flex-col p-0 gap-0">
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle>{t("settings.modules.manageTitle")}</DialogTitle>
                <DialogDescription>
                  {t("settings.modules.manageDescription")}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-6 pt-4">
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
                      const isVisible = modules[moduleId] ?? true;

                      return (
                        <Reorder.Item
                          key={moduleId}
                          value={moduleId}
                          className={cn(
                            "flex items-center justify-between p-3 bg-card border rounded-lg cursor-move hover:bg-muted/50 transition-colors shadow-sm active:scale-[0.98]",
                            !meta.isCore && "border-primary/30",
                            !isVisible && "opacity-75 bg-muted/30",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
                            <div
                              className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center",
                                meta.isCore ? "bg-muted" : "bg-primary/10",
                              )}
                            >
                              {Icon && (
                                <Icon
                                  className={cn(
                                    "h-4 w-4",
                                    meta.isCore
                                      ? "text-muted-foreground"
                                      : "text-primary",
                                  )}
                                />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor={`module-${moduleId}`}
                                  className={cn(
                                    "cursor-pointer font-medium text-sm truncate",
                                    !isVisible &&
                                      "text-muted-foreground line-through decoration-slate-400/50",
                                  )}
                                >
                                  {meta.label}
                                </Label>
                                {!meta.isCore && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 border-primary/50 text-primary font-black shrink-0 h-4"
                                  >
                                    PRO
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <Switch
                              id={`module-${moduleId}`}
                              checked={isVisible}
                              onCheckedChange={(checked) =>
                                toggleModule(moduleId, checked)
                              }
                            />
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-muted/10 flex justify-end">
                <Button onClick={() => setIsOpen(false)}>
                  {t("common.actions.done")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {displayOrder
            .filter((id) => modules[id] ?? true)
            .map((id) => {
              const meta = getModuleMeta(id);
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="font-normal text-muted-foreground"
                >
                  {meta.label}
                </Badge>
              );
            })}
          {enabledCount === 0 && (
            <span className="text-sm text-muted-foreground italic">
              {t("settings.modules.noModulesEnabled")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
