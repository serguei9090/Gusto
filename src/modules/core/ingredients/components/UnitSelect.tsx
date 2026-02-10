import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UNIT_CATEGORY_LABELS,
  UNIT_DISPLAY_ORDER,
} from "@/lib/constants/units";
import { useConfigStore } from "@/modules/core/settings/store/config.store";

export interface UnitSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function UnitSelect({
  value,
  onValueChange,
  placeholder = "Select unit",
  className,
}: UnitSelectProps) {
  const { getUnits } = useConfigStore();
  const dynamicUnits = getUnits();
  const validUnits = new Set(dynamicUnits);

  // Filter and group units based on standardized display order
  const groups = Object.entries(UNIT_DISPLAY_ORDER).map(([key, units]) => {
    const availableUnits = units.filter((u) => validUnits.has(u));
    return {
      label: UNIT_CATEGORY_LABELS[key] || key,
      units: availableUnits,
    };
  });

  // Find any units in the store that weren't captured in our explicit groups
  const groupedUnitSet = new Set(groups.flatMap((g) => g.units));
  const remainingUnits = dynamicUnits.filter((u) => !groupedUnitSet.has(u));

  if (remainingUnits.length > 0) {
    groups.push({
      label: UNIT_CATEGORY_LABELS.misc,
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
              <SelectLabel>{group.label}</SelectLabel>
              {group.units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : null,
        )}
      </SelectContent>
    </Select>
  );
}
