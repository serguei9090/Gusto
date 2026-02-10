import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
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
import { useSettingsStore } from "../store/settings.store";

export const ModulesSection = () => {
  const { t } = useTranslation();
  const { modules, moduleOrder, toggleModule, reorderModules } =
    useSettingsStore();

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
          values={moduleOrder}
          onReorder={reorderModules}
          className="space-y-2"
        >
          {moduleOrder.map((moduleId) => (
            <Reorder.Item
              key={moduleId}
              value={moduleId}
              className="flex items-center justify-between p-3 bg-card border rounded-md cursor-move hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <Label
                    htmlFor={`module-${moduleId}`}
                    className="cursor-pointer font-medium"
                  >
                    {t(`navigation.${moduleId}`)}
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {modules[moduleId]
                    ? t("settings.modules.visible")
                    : t("settings.modules.hidden")}
                </span>
                <Switch
                  id={`module-${moduleId}`}
                  checked={modules[moduleId] ?? true}
                  onCheckedChange={(checked) => toggleModule(moduleId, checked)}
                />
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </CardContent>
    </Card>
  );
};
