import { Reorder } from "framer-motion";
import { Plus, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfigStore } from "../store/config.store";

interface CategoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "ingredient_category" | "recipe_category";
  title: string;
  description: string;
}

export const CategoryConfigModal = ({
  isOpen,
  onClose,
  type,
  title,
  description,
}: CategoryConfigModalProps) => {
  const { t } = useTranslation();
  const { items, addItem, removeItem, restoreDefaults, reorder } =
    useConfigStore();
  const [newValue, setNewValue] = useState("");

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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideClose
        className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-md sm:h-auto sm:max-h-[85vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]"
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 -mr-2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-6">
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder={`${t("common.actions.add")}...`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="h-12 bg-muted/30 border-muted-foreground/30 focus:border-primary focus:bg-background transition-all"
              />
              <Button
                className="h-12 w-12 shrink-0"
                size="icon"
                onClick={handleAdd}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestore}
                className="text-xs h-7"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {t("settings.currency.resetDefaults")}
              </Button>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <Reorder.Group
                axis="y"
                values={filteredItems}
                onReorder={reorder}
                className="space-y-2"
              >
                {filteredItems.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="flex items-center justify-between p-3 bg-card border rounded-md cursor-move hover:bg-muted/50 transition-colors group"
                  >
                    <span className="font-medium text-sm">{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t("common.messages.noData")}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t bg-background sm:static sm:border-0 sm:pt-4 sm:pb-4 sm:justify-end">
          <Button
            className="w-full sm:w-auto h-12 sm:h-9 text-lg sm:text-sm"
            variant="outline"
            onClick={onClose}
          >
            {t("common.actions.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
