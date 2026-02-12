import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIT_TYPES } from "../lib/unit-utils";

interface UnitSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  category?: string;
}

export const UnitSelect = ({
  value,
  onValueChange,
  className,
  category,
}: UnitSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unit" />
      </SelectTrigger>
      <SelectContent>
        {category && UNIT_TYPES[category]
          ? UNIT_TYPES[category].map((u) => (
              <SelectItem key={`${category}-${u}`} value={u}>
                {u}
              </SelectItem>
            ))
          : Object.entries(UNIT_TYPES).map(([type, units]) => (
              <SelectGroup key={type}>
                <SelectLabel className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase bg-muted/30">
                  {type}
                </SelectLabel>
                {units.map((u) => (
                  <SelectItem key={`${type}-${u}`} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
      </SelectContent>
    </Select>
  );
};
