import { Reorder } from "framer-motion";
import { Plus, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "@/hooks/useTranslation";
import { useMobileComponent } from "@/lib/mobile-registry";
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
  const isMobile = useMobile();
  const MobileComponent = useMobileComponent("MobileCategoryConfig");
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
        className={`${isMobile ? "w-full max-w-full rounded-none border-x-0 p-4 pt-6 top-16 translate-y-0 h-[calc(100dvh-4rem)]" : "max-w-md max-h-[90vh]"} flex flex-col p-0`}
      >
        {isMobile && MobileComponent ? (
          <div className="p-4">
            <MobileComponent
              title={title}
              description={description}
              items={filteredItems}
              newValue={newValue}
              setNewValue={setNewValue}
              handleAdd={handleAdd}
              handleRestore={handleRestore}
              removeItem={removeItem}
              reorder={reorder}
              t={t}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-6">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle>{title}</DialogTitle>
              </div>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`${t("common.actions.add")}...`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="h-12"
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
        )}
      </DialogContent>
    </Dialog>
  );
};
