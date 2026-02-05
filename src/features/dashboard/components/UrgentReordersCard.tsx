import { AlertCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UrgentReorderItem } from "../types";

interface UrgentReordersCardProps {
  items: UrgentReorderItem[];
}

export function UrgentReordersCard({ items }: UrgentReordersCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Urgent Reorders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
            <p>Stock levels healthy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock:{" "}
                    <span className="text-destructive font-semibold">
                      {item.currentStock}
                    </span>{" "}
                    / {item.minStockLevel} {item.unit}
                  </p>
                </div>
                <Badge variant="destructive">
                  -{item.deficit} {item.unit}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
