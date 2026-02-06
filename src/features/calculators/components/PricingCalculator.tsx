import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const PricingCalculator = () => {
  const [cost, setCost] = useState<number>(0);
  const [targetPercent, setTargetPercent] = useState<number>(25);

  const suggestedPrice = useMemo(() => {
    if (cost <= 0 || targetPercent <= 0) return 0;
    return cost / (targetPercent / 100);
  }, [cost, targetPercent]);

  const targets = [
    { label: "High Volume (Fast Food)", value: 40, color: "bg-blue-500" },
    { label: "Standard Casual", value: 30, color: "bg-green-500" },
    { label: "Upscale / Fine Dining", value: 25, color: "bg-purple-500" },
    { label: "Bar / Beverage", value: 20, color: "bg-yellow-500" },
    { label: "High Margin (Pizza/Pasta)", value: 15, color: "bg-orange-500" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pricing Calculator</CardTitle>
        <CardDescription>
          Determine your selling price based on food cost percentage goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Total Ingredient Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                value={cost || ""}
                onChange={(e) =>
                  setCost(Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Target Cost %</Label>
                <span className="font-bold text-primary">{targetPercent}%</span>
              </div>
              <Slider
                value={[targetPercent]}
                onValueChange={(vals: number[]) => setTargetPercent(vals[0])}
                max={100}
                min={1}
                step={1}
              />
            </div>

            <div className="pt-4 border-t">
              <Label>Quick Presets:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {targets.map((t) => (
                  <Badge
                    key={t.value}
                    className={`${t.color} text-white cursor-pointer hover:opacity-80`}
                    onClick={() => setTargetPercent(t.value)}
                  >
                    {t.value}% - {t.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl border border-primary/20">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
              Suggested Selling Price
            </span>
            <div className="text-5xl font-bold text-primary my-2">
              ${suggestedPrice.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground italic text-center mt-2">
              At {targetPercent}% food cost, your gross profit is $
              {(suggestedPrice - cost).toFixed(2)} per plate.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
