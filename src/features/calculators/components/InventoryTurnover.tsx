import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
} from "lucide-react";
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

export const InventoryTurnover = () => {
  const [cogs, setCogs] = useState<number>(0); // Cost of Goods Sold
  const [startInv, setStartInv] = useState<number>(0);
  const [endInv, setEndInv] = useState<number>(0);

  const stats = useMemo(() => {
    const avgInv = (startInv + endInv) / 2;
    const ratio = avgInv > 0 ? cogs / avgInv : 0;
    const daysInPeriod = 30; // Assuming monthly
    const daysToTurn = ratio > 0 ? daysInPeriod / ratio : 0;

    let status = "neutral";
    let message = "Fill in the metrics to see your inventory health.";

    if (ratio > 8) {
      status = "high";
      message =
        "Very fast turnover. High efficiency, but watch for stock-outs.";
    } else if (ratio >= 4) {
      status = "good";
      message = "Healthy turnover for most restaurants (4-8 times/month).";
    } else if (ratio > 0) {
      status = "low";
      message = "Low turnover. Risk of spoilage or tied up capital.";
    }

    return { avgInv, ratio, daysToTurn, status, message };
  }, [cogs, startInv, endInv]);

  const StatusIcon = () => {
    if (stats.status === "good")
      return <CheckCircle2 className="text-green-500 h-10 w-10" />;
    if (stats.status === "high")
      return <TrendingUp className="text-blue-500 h-10 w-10" />;
    if (stats.status === "low")
      return <AlertTriangle className="text-orange-500 h-10 w-10" />;
    return <AlertCircle className="text-muted-foreground h-10 w-10" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Inventory Health (Turnover)</CardTitle>
        <CardDescription>
          Measure how efficiently you are moving stock and identifying spoilage
          risks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Cost of Goods Sold (Total Sales Value of Food in Month)
              </Label>
              <Input
                type="number"
                placeholder="e.g. $40,000"
                value={cogs || ""}
                onChange={(e) =>
                  setCogs(Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starting Inventory ($)</Label>
                <Input
                  type="number"
                  placeholder="$5,000"
                  value={startInv || ""}
                  onChange={(e) =>
                    setStartInv(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ending Inventory ($)</Label>
                <Input
                  type="number"
                  placeholder="$5,000"
                  value={endInv || ""}
                  onChange={(e) =>
                    setEndInv(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="p-6 bg-muted/30 rounded-xl border flex items-center gap-6">
              <StatusIcon />
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                  Monthly Turnover Ratio
                </span>
                <div className="text-4xl font-black text-foreground">
                  {stats.ratio.toFixed(2)}x
                </div>
                <div className="text-sm font-medium">{stats.message}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Avg Inventory Value
                </span>
                <div className="text-xl font-bold">
                  ${stats.avgInv.toLocaleString()}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <span className="text-xs text-muted-foreground uppercase font-bold">
                  Avg Stock Age
                </span>
                <div className="text-xl font-bold">
                  {stats.daysToTurn.toFixed(1)} days
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm flex gap-2 text-blue-800 italic">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            High Turnover = Fresh/Fast movement. Low Turnover = Potential
            Spoilage or Over-buying.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
