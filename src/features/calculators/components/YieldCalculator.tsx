import { AlertCircle, ArrowDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SmartNumericInput } from "./SmartNumericInput";
import { UnitSelect } from "./UnitSelect";
import { convert } from "../lib/unit-utils";

export const YieldCalculator = () => {
  const [apWeight, setApWeight] = useState<number>(1);
  const [apUnit, setApUnit] = useState<string>("kg");
  const [epWeight, setEpWeight] = useState<number>(0.8);
  const [epUnit, setEpUnit] = useState<string>("kg");
  const [apPrice, setApPrice] = useState<number>(10);

  const stats = useMemo(() => {
    // Convert EP weight to AP weight's unit for accurate percentage calculation
    const epWeightInApUnit = convert(epWeight, epUnit, apUnit);

    const yieldPercent = apWeight > 0 ? (epWeightInApUnit / apWeight) * 100 : 0;
    const trueCost = yieldPercent > 0 ? apPrice / (yieldPercent / 100) : 0;

    const lossWeightInAp = Math.max(0, apWeight - epWeightInApUnit);
    const lossValue = apWeight > 0 ? (lossWeightInAp / apWeight) * apPrice : 0;

    // Smart loss display (convert to g or oz if too small in the main unit)
    const lossInGrams = convert(lossWeightInAp, apUnit, "g");
    let lossDisplay = "";
    if (lossInGrams >= 1000) {
      lossDisplay = `${(lossInGrams / 1000).toFixed(2)}kg`;
    } else if (lossInGrams >= 1) {
      // If imperial, maybe show oz
      if (apUnit === "lb" || apUnit === "oz") {
        const oz = convert(lossInGrams, "g", "oz");
        lossDisplay = oz >= 1 ? `${oz.toFixed(1)}oz` : `${Math.round(lossInGrams)}g`;
      } else {
        lossDisplay = `${Math.round(lossInGrams)}g`;
      }
    } else {
      lossDisplay = `${lossWeightInAp.toFixed(2)}${apUnit}`;
    }

    return { yieldPercent, trueCost, lossWeight: lossWeightInAp, lossValue, lossDisplay, apUnit };
  }, [apWeight, apUnit, epWeight, epUnit, apPrice]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Yield & Waste Tool (EP vs. AP)</CardTitle>
        <CardDescription>
          EP (Edible Portion) vs AP (As Purchased). Calculate true ingredient
          costs after trimming and cleaning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Weight As Purchased (AP)</Label>
              <div className="flex gap-2">
                <SmartNumericInput
                  value={apWeight}
                  onChange={setApWeight}
                  placeholder="1.0"
                  className="flex-1"
                />
                <UnitSelect
                  value={apUnit}
                  onValueChange={setApUnit}
                  className="w-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Weight After Cleaning/Cooking (EP)</Label>
              <div className="flex gap-2">
                <SmartNumericInput
                  value={epWeight}
                  onChange={setEpWeight}
                  placeholder="0.8"
                  className="flex-1"
                />
                <UnitSelect
                  value={epUnit}
                  onValueChange={setEpUnit}
                  className="w-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price As Purchased (AP Price per {apUnit})</Label>
              <SmartNumericInput
                value={apPrice}
                onChange={setApPrice}
                placeholder="10.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">
                Yield Percentage
              </Label>
              <div className="text-3xl font-bold text-primary">
                {stats.yieldPercent.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                This is how much usable product remains.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border space-y-1 ${stats.trueCost > apPrice
                ? "bg-orange-50 border-orange-200"
                : "bg-green-50 border-green-200"
                }`}
            >
              <Label className="text-xs text-muted-foreground uppercase">
                True Cost (EP Price per {apUnit})
              </Label>
              <div className="text-3xl font-bold">
                ${stats.trueCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Your actual cost per usable unit.
              </p>
            </div>

            <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">
                Waste Impact
              </Label>
              <div className="flex items-center gap-2">
                <ArrowDown className="text-destructive h-5 w-5" />
                <div className="text-3xl font-bold text-destructive">
                  ${stats.lossValue.toFixed(2)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Value lost in trimmings/waste ({stats.lossWeight.toFixed(2)}{" "}
                {stats.apUnit}).
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-3 bg-muted rounded-md text-sm italic">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            If you buy 1{apUnit} for ${apPrice.toFixed(2)} but throw away{" "}
            {stats.lossDisplay} of trimmings, your usable cost is actually{" "}
            ${stats.trueCost.toFixed(2)} per {apUnit}.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
