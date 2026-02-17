import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";

interface LaborInputProps {
  hourlyRate: number;
  minutes: number;
  onChange: (rate: number, minutes: number) => void;
}

export function LaborInput({ hourlyRate, minutes, onChange }: LaborInputProps) {
  const [rate, setRate] = useState(hourlyRate.toString());
  const [time, setTime] = useState(minutes.toString());

  useEffect(() => {
    setRate(hourlyRate.toString());
    setTime(minutes.toString());
  }, [hourlyRate, minutes]);

  const handleChange = (newRate: string, newTime: string) => {
    setRate(newRate);
    setTime(newTime);
    const r = parseFloat(newRate) || 0;
    const t = parseFloat(newTime) || 0;
    onChange(r, t);
  };

  const calculatedCost =
    (parseFloat(rate || "0") / 60) * parseFloat(time || "0");

  return (
    <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
      <div>
        <Label>Hourly Rate</Label>
        <Input
          type="number"
          value={rate}
          onChange={(e) => handleChange(e.target.value, time)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Prep Time (Min)</Label>
        <Input
          type="number"
          value={time}
          onChange={(e) => handleChange(rate, e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="flex flex-col justify-between">
        <Label>Direct Labor Cost</Label>
        <div className="h-10 flex items-center text-lg font-mono">
          <CurrencyDisplay amount={calculatedCost} />
        </div>
      </div>
    </div>
  );
}
