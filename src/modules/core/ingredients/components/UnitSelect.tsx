import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigStore } from "@/modules/core/settings/store/config.store";

// Define the groups and order explicitly
const UNIT_ORDER = {
  mass: ["mg", "g", "oz", "lb", "kg"],
  volume: ["ml", "tsp", "tbsp", "cup", "pt", "qt", "l", "gal"],
  other: ["piece"],
};

const LABELS: Record<string, string> = {
  mass: "Mass / Weight",
  volume: "Volume",
  other: "Other",
};

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

  // Filter and group units
  const groups = Object.entries(UNIT_ORDER).map(([key, units]) => {
    const availableUnits = units.filter((u) => validUnits.has(u));
    return {
      label: LABELS[key],
      units: availableUnits,
    };
  });

  // Find any units in the store that weren't captured in our explicit groups
  const groupedUnitSet = new Set(groups.flatMap((g) => g.units));
  const remainingUnits = dynamicUnits.filter((u) => !groupedUnitSet.has(u));

  if (remainingUnits.length > 0) {
    groups.push({
      label: "Misc",
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
