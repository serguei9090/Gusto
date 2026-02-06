import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIT_TYPES } from "../lib/unit-utils";

interface UnitSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const UnitSelect = ({
  value,
  onValueChange,
  className,
}: UnitSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Unit" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(UNIT_TYPES).map(([type, units]) => (
          <div key={type}>
            <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase bg-muted/30">
              {type}
            </div>
            {units.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};
