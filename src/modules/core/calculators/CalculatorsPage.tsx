import { ArrowRightLeft, Calculator, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMobile } from "@/hooks/useMobile";
import { useMobileComponent } from "@/lib/mobile-registry";
import { InventoryTurnover } from "./components/InventoryTurnover";
import { LaborCosting } from "./components/LaborCosting";
import { PlateCostSandbox } from "./components/PlateCostSandbox";
// Import sub-calculators
import { PricingCalculator } from "./components/PricingCalculator";
import { SimpleUnitConversion } from "./components/SimpleUnitConversion";
import { UnitConversion } from "./components/UnitConversion";
import { YieldCalculator } from "./components/YieldCalculator";

export const CalculatorsPage = () => {
  const [activeCalc, setActiveCalc] = useState("pricing");
  const isMobile = useMobile();
  const MobileCalculators = useMobileComponent("MobileCalculators");

  if (isMobile && MobileCalculators) {
    return <MobileCalculators />;
  }

  const calculators = [
    {
      id: "pricing",
      name: "Pricing Calculator (Food Cost %)",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: "yield",
      name: "Yield & Waste Tool (EP vs. AP)",
      icon: <ChevronRight className="h-4 w-4" />,
    },
    {
      id: "sandbox",
      name: "Plate Costing Sandbox",
      icon: <Info className="h-4 w-4" />,
    },
    {
      id: "turnover",
      name: "Inventory Health (Turnover)",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: "conversion",
      name: "Unit Conversion Engine",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: "labor",
      name: "Labor-Inclusive Prime Cost",
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: "simple_conversion",
      name: "Simple Unit Converter",
      icon: <ArrowRightLeft className="h-4 w-4" />,
    },
  ];

  const renderCalculator = () => {
    switch (activeCalc) {
      case "pricing":
        return <PricingCalculator />;
      case "yield":
        return <YieldCalculator />;
      case "sandbox":
        return <PlateCostSandbox />;
      case "turnover":
        return <InventoryTurnover />;
      case "conversion":
        return <UnitConversion />;
      case "labor":
        return <LaborCosting />;
      case "simple_conversion":
        return <SimpleUnitConversion />;
      default:
        return <PricingCalculator />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Math Helpers</h2>
        <p className="text-muted-foreground">
          Quick tools for kitchen math, pricing, and cost analysis without
          modifying your inventory.
        </p>
      </div>

      <div className="flex flex-col space-y-4 max-w-4xl">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium w-32">Select Tool:</span>
          <Select value={activeCalc} onValueChange={setActiveCalc}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a calculator" />
            </SelectTrigger>
            <SelectContent>
              {calculators.map((calc) => (
                <SelectItem key={calc.id} value={calc.id}>
                  <div className="flex items-center gap-2">
                    {calc.icon}
                    {calc.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">{renderCalculator()}</div>
      </div>
    </div>
  );
};
