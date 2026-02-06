import { ArrowRightLeft } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UnitSelect } from "./UnitSelect";
import { SmartNumericInput } from "./SmartNumericInput";
import { CONVERSION_RATES } from "../lib/unit-utils";

export const UnitConversion = () => {
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [purchaseUnit, setPurchaseUnit] = useState<string>("lb");
  const [purchasePrice, setPurchasePrice] = useState<number>(10);

  const [recipeQty, setRecipeQty] = useState<number>(250);
  const [recipeUnit, setRecipeUnit] = useState<string>("g");

  const results = useMemo(() => {
    const buyInBase = purchaseQty * (CONVERSION_RATES[purchaseUnit] || 1);
    const pricePerBase = buyInBase > 0 ? purchasePrice / buyInBase : 0;
    const recipeInBase = recipeQty * (CONVERSION_RATES[recipeUnit] || 1);
    const recipeCost = pricePerBase * recipeInBase;

    return { recipeCost, pricePerBase };
  }, [purchaseQty, purchaseUnit, purchasePrice, recipeQty, recipeUnit]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Unit Conversion Engine</CardTitle>
        <CardDescription>
          Convert bulk purchase prices into exact recipe portion costs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-4">
              Purchase Information (Bulk)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <SmartNumericInput
                  value={purchaseQty}
                  onChange={setPurchaseQty}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <UnitSelect value={purchaseUnit} onValueChange={setPurchaseUnit} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bulk Price ($)</Label>
              <SmartNumericInput
                value={purchasePrice}
                onChange={setPurchasePrice}
                placeholder="10.00"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-xl bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-sm uppercase text-primary mb-4">
              Recipe Usage
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Required Quantity</Label>
                <SmartNumericInput
                  value={recipeQty}
                  onChange={setRecipeQty}
                  placeholder="250"
                />
              </div>
              <div className="space-y-2">
                <Label>Usage Unit</Label>
                <UnitSelect value={recipeUnit} onValueChange={setRecipeUnit} />
              </div>
            </div>

            <div className="pt-6 border-t border-primary/10 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold">
                Cost for this Portion
              </span>
              <div className="text-4xl font-black text-primary my-1">
                ${results.recipeCost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Bought {purchaseQty} {purchaseUnit} for ${purchasePrice.toFixed(2)}.
                Each {recipeUnit} costs ${(results.recipeCost / (recipeQty || 1)).toFixed(2)}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-2 text-muted-foreground">
          <ArrowRightLeft className="h-6 w-6 opacity-20" />
        </div>
      </CardContent>
    </Card>
  );
};
