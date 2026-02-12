import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import { useConfigStore } from "../store/config.store";

interface UnitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper for sorting units from small to large
const UNIT_MAGNITUDE: Record<string, number> = {
  // Mass
  mg: 1,
  g: 2,
  oz: 3,
  lb: 4,
  kg: 5,
  // Volume
  drop: 1,
  pinch: 2,
  dash: 3,
  tsp: 4,
  tbsp: 5,
  "fl oz": 6,
  cl: 7,
  dl: 8,
  cup: 9,
  pt: 10,
  qt: 11,
  l: 12,
  gal: 13,
  // Length
  mm: 1,
  cm: 2,
  in: 3,
  ft: 4,
  yd: 5,
  m: 6,
  // Count (approx)
  each: 1,
  piece: 1,
  pack: 2,
  bunch: 2,
  bottle: 2,
  can: 2,
  box: 3,
  case: 3,
  bundle: 3,
  roll: 3,
  bag: 3,
  jar: 3,
};

const getMagnitude = (unit: string) =>
  UNIT_MAGNITUDE[unit.toLowerCase()] || 999;

export const UnitConfigModal = ({ isOpen, onClose }: UnitConfigModalProps) => {
  const { t } = useTranslation();
  const { items, addItem, removeItem } = useConfigStore();
  const [filterText, setFilterText] = useState("");

  // Get active units map: UnitName -> ID
  const activeUnitsMap = useMemo(() => {
    const map = new Map<string, number>();
    items
      .filter((item) => item.type.startsWith("unit") && item.is_active === 1)
      .forEach((item) => {
        map.set(item.name.toLowerCase(), item.id);
      });
    return map;
  }, [items]);

  const handleToggle = async (
    category: string,
    unit: string,
    isActive: boolean,
  ) => {
    try {
      if (isActive) {
        // Remove
        const id = activeUnitsMap.get(unit.toLowerCase());
        if (id !== undefined) {
          await removeItem(id);
          toast.success(`Removed ${unit}`, { duration: 1500 });
        }
      } else {
        // Add
        await addItem(`unit:${category.toLowerCase()}`, unit);
        toast.success(`Added ${unit}`, { duration: 1500 });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update unit");
    }
  };

  const groupedUnits = useMemo(() => {
    const groups: {
      category: string;
      units: { id: number; name: string }[];
    }[] = [];
    const lowerFilter = filterText.toLowerCase();

    // Group items by category (type)
    const categoryMap = new Map<string, { id: number; name: string }[]>();

    items
      .filter((item) => item.type.startsWith("unit"))
      .forEach((item) => {
        const category = item.type.split(":")[1] || "other";
        // Use raw category key
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)?.push({ id: item.id, name: item.name });
      });

    // Process groups
    categoryMap.forEach((units, category) => {
      // Filter units based on search or show all if translated category matches
      // We need to check against translated name for search
      const translatedCategory = t(`common.unit_categories.${category}`, {
        defaultValue: category,
      });
      const categoryMatch = translatedCategory
        .toLowerCase()
        .includes(lowerFilter);

      const filteredUnits = units.filter(
        (u) => categoryMatch || u.name.toLowerCase().includes(lowerFilter),
      );

      if (filteredUnits.length > 0) {
        // Sort by magnitude
        const sortedUnits = [...filteredUnits].sort(
          (a, b) => getMagnitude(a.name) - getMagnitude(b.name),
        );
        groups.push({ category, units: sortedUnits });
      }
    });

    // Sort groups by fixed order
    const CATEGORY_ORDER = ["mass", "volume", "length", "misc", "other"];
    groups.sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.category);
      const idxB = CATEGORY_ORDER.indexOf(b.category);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.category.localeCompare(b.category);
    });

    return groups;
  }, [items, filterText, t]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-2xl sm:h-[80vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{t("settings.config.units")}</DialogTitle>
          <DialogDescription>
            {t("settings.config.unitsDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4 p-4 md:p-6 overflow-hidden">
          <div className="relative shrink-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.actions.search")}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 h-12"
            />
          </div>

          <ScrollArea className="flex-1 -mr-4 pr-4 h-full">
            <div className="space-y-6 pb-4 md:pb-6">
              {groupedUnits.map(({ category, units }) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                    {t(`common.unit_categories.${category}`, {
                      defaultValue: category,
                    })}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {units.map((unit) => {
                      const isActive = activeUnitsMap.has(
                        unit.name.toLowerCase(),
                      );
                      // Use mapped ID for toggle if active, otherwise uses name to add
                      // If there are duplicates, activeUnitsMap might have a different ID than unit.id
                      // But since we want to toggle THIS specific button, we should likely check if THIS unit is active.
                      // However, logic relies on isActive.
                      // If I have 2 'cup's, and both are in items.
                      // If activeUnitsMap has 'cup', it means AT LEAST one is active.
                      // If I use unit.id as key, React is happy.
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() =>
                            handleToggle(category, unit.name, isActive)
                          }
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all duration-200 w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            isActive
                              ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/20 shadow-sm font-medium"
                              : "bg-card hover:bg-muted/60 hover:border-foreground/20 text-muted-foreground",
                          )}
                        >
                          <span>{unit.name}</span>
                          {isActive && <Check className="h-3.5 w-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {groupedUnits.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {t("common.messages.noData")}
                </div>
              )}
            </div>
          </ScrollArea>
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
