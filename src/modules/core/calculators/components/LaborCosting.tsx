import { Clock, User } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LaborCosting = () => {
  const [foodCost, setFoodCost] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(20);
  const [prepMinutes, setPrepMinutes] = useState<number>(15);
  const [batchSize, setBatchSize] = useState<number>(1);

  const stats = useMemo(() => {
    const totalLaborCost = (hourlyRate * prepMinutes) / 60;
    const laborPerPortion = totalLaborCost / batchSize;
    const primeCost = foodCost + laborPerPortion;
    const laborPercentage = (laborPerPortion / primeCost) * 100;

    return { totalLaborCost, laborPerPortion, primeCost, laborPercentage };
  }, [foodCost, hourlyRate, prepMinutes, batchSize]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Labor-Inclusive Prime Cost</CardTitle>
        <CardDescription>
          Calculate the true cost of "labor-intensive" dishes that require
          significant prep time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chef/Worker Hourly Rate ($)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  className="pl-10"
                  value={hourlyRate || ""}
                  onChange={(e) =>
                    setHourlyRate(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minutes of Prep/Cooking Work</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="e.g. 30"
                  className="pl-10"
                  value={prepMinutes || ""}
                  onChange={(e) =>
                    setPrepMinutes(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Size (Portions)</Label>
                <Input
                  type="number"
                  value={batchSize || ""}
                  onChange={(e) =>
                    setBatchSize(Number.parseFloat(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Food Cost per Portion ($)</Label>
                <Input
                  type="number"
                  value={foodCost || ""}
                  onChange={(e) =>
                    setFoodCost(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold">
                    Labor Cost per Portion
                  </span>
                  <div className="text-3xl font-black text-foreground">
                    ${stats.laborPerPortion.toFixed(2)}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold text-right block">
                    Labor % of Prime
                  </span>
                  <div className="text-xl font-bold text-primary">
                    {stats.laborPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-primary uppercase">
                    Total Prime Cost
                  </span>
                  <div className="text-5xl font-black text-primary">
                    ${stats.primeCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg border text-sm italic text-muted-foreground">
              Prime Cost = Food Cost + Direct Labor. This prevents underpricing
              handmade items like pasta, dumplings, or complex sauces that have
              cheap ingredients but high work requirements.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
