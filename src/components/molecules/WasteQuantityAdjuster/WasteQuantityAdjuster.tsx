import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WasteQuantityAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  unit: string;
}

export const WasteQuantityAdjuster = ({
  value,
  onChange,
  unit,
}: WasteQuantityAdjusterProps) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleIncrement = (amount: number) => {
    const newValue = Math.max(0, value + amount);
    onChange(Number(newValue.toFixed(2)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-14 w-14 shrink-0 rounded-full"
          onClick={() => handleIncrement(-1)}
          disabled={value <= 0}
        >
          <Minus className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center">
          <div className="relative">
            <Input
              type="number"
              value={localValue}
              onChange={handleInputChange}
              className="h-14 text-center text-2xl font-bold font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              {unit}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-14 w-14 shrink-0 rounded-full"
          onClick={() => handleIncrement(1)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Smart Increments */}
      <div className="flex gap-2 justify-center">
        {[0.1, 0.5, 5, 10].map((inc) => (
          <Button
            key={inc}
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1 rounded-full text-xs font-semibold"
            onClick={() => handleIncrement(inc)}
          >
            +{inc}
          </Button>
        ))}
      </div>
    </div>
  );
};
