import { Reorder } from "framer-motion";
import { Plus, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfigStore } from "../store/config.store";

interface ConfigItemManagerProps {
  type: "unit" | "ingredient_category" | "recipe_category";
  title: string;
  description: string;
}

export const ConfigItemManager = ({
  type,
  title,
  description,
}: ConfigItemManagerProps) => {
  const { t } = useTranslation();
  const { items, addItem, removeItem, restoreDefaults, reorder } =
    useConfigStore();
  const [newValue, setNewValue] = useState("");
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  const filteredItems = items.filter((item) => item.type === type);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    try {
      await addItem(type, newValue.trim());
      setNewValue("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreDefaults(type);
      setIsRestoreOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t("settings.currency.resetDefaults")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("common.actions.reset")} {title}?
              </DialogTitle>
              <DialogDescription>
                This will add back any missing default items. Your custom items
                will not be affected.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("common.actions.cancel")}</Button>
              </DialogClose>
              <Button onClick={handleRestore}>
                {t("common.actions.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={`${t("common.actions.add")} ${title.toLowerCase()}...`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="max-w-[300px]"
        />
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {t("common.actions.add")}
        </Button>
      </div>

      <Reorder.Group
        axis="x"
        values={filteredItems}
        onReorder={reorder}
        className="flex flex-wrap gap-2 list-none p-0"
      >
        {filteredItems.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            whileDrag={{ scale: 1.05 }}
            className="relative flex items-center justify-center min-w-[3rem] px-4 py-2 bg-muted rounded-md text-sm font-medium group transition-colors hover:bg-muted/80 border border-border cursor-move"
          >
            <span className="text-center select-none">{item.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
              title="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};
