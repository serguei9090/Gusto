import { ArrowRightLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartNumericInput } from "@/components/atoms/SmartNumericInput";
import { UnitSelect } from "@/components/atoms/UnitSelectCalculators";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convert, UNIT_TYPES } from "@/utils/unit-calculators";

export const SimpleUnitConversion = () => {
  const [amount, setAmount] = useState<number>(1);
  const [category, setCategory] = useState<string>("Mass");

  // Default to first unit in category if no override
  const [fromUnit, setFromUnit] = useState<string>(UNIT_TYPES.Mass[4]); // lb
  const [toUnit, setToUnit] = useState<string>(UNIT_TYPES.Mass[1]); // kg

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Reset units to first available in new category
    const units = UNIT_TYPES[newCategory];
    if (units && units.length > 0) {
      setFromUnit(units[0]);
      setToUnit(units[1] || units[0]);
    }
  };

  const result = useMemo(() => {
    return convert(amount, fromUnit, toUnit);
  }, [amount, fromUnit, toUnit]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Simple Unit Converter</CardTitle>
        <CardDescription>
          Quickly convert between different units of measurement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Conversion Type</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(UNIT_TYPES)
                  .filter((type) => type !== "Misc" && type !== "Other")
                  .map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Input Side */}
            <div className="space-y-4 p-4 border rounded-xl bg-card">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-4">
                From
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <SmartNumericInput
                    value={amount}
                    onChange={setAmount}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <UnitSelect
                    value={fromUnit}
                    onValueChange={setFromUnit}
                    category={category}
                  />
                </div>
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-4">
                To
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Unit</Label>
                  <UnitSelect
                    value={toUnit}
                    onValueChange={setToUnit}
                    category={category}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Result</Label>
                  <div className="text-3xl font-bold mt-2 break-all">
                    {/* Result is always compatible due to category selection */}
                    {new Intl.NumberFormat(undefined, {
                      maximumFractionDigits: 6,
                    }).format(result)}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      {toUnit}
                    </span>
                  </div>
                </div>
              </div>
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
