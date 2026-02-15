import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { useConfigStore } from "@/modules/core/settings/store/config.store";

export interface UnitSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  filterType?: "ingredient" | "asset";
}

export function UnitSelect({
  value,
  onValueChange,
  placeholder = "Select unit",
  className,
  filterType,
}: UnitSelectProps) {
  const { getUnits } = useConfigStore();
  const dynamicUnits = getUnits();
  const { t } = useTranslation();

  // Define category order based on filterType
  let CATEGORY_ORDER = ["mass", "volume", "length", "misc", "other"];

  if (filterType === "ingredient") {
    CATEGORY_ORDER = ["mass", "volume", "misc", "other"];
  } else if (filterType === "asset") {
    CATEGORY_ORDER = ["length", "misc", "other"];
  }

  // Group units by category
  const groups = CATEGORY_ORDER.map((categoryKey) => {
    const categoryType = `unit:${categoryKey}`;
    // Filter units that belong to this category
    const units = dynamicUnits.filter((u) => u.type === categoryType);
    return {
      label: t(`common.unit_categories.${categoryKey}`, {
        defaultValue: categoryKey,
      }),
      units,
    };
  });

  // Find units that didn't match any standard category
  const knownTypes = new Set(CATEGORY_ORDER.map((k) => `unit:${k}`));
  const remainingUnits = dynamicUnits.filter((u) => !knownTypes.has(u.type));

  if (remainingUnits.length > 0) {
    groups.push({
      label: "Custom / Other",
      units: remainingUnits,
    });
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) =>
          group.units.length > 0 ? (
            <SelectGroup key={group.label}>
              <SelectLabel className="font-semibold text-muted-foreground pl-2 py-1 text-xs uppercase tracking-wider">
                {group.label}
              </SelectLabel>
              {group.units.map((unit) => (
                <SelectItem key={unit.name} value={unit.name}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : null,
        )}
      </SelectContent>
    </Select>
  );
}
