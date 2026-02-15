import {
  ArrowRightLeft,
  Calculator,
  ChevronRight,
  Info,
  Percent,
} from "lucide-react";
import { useState } from "react";
import { InventoryTurnover } from "@/components/organisms/InventoryTurnover";
import { LaborCosting } from "@/components/organisms/LaborCosting";
import { PlateCostSandbox } from "@/components/organisms/PlateCostSandbox";
import { PricingCalculator } from "@/components/organisms/PricingCalculator";
import { SimpleUnitConversion } from "@/components/organisms/SimpleUnitConversion";
import { UnitConversion } from "@/components/organisms/UnitConversion";
import { YieldCalculator } from "@/components/organisms/YieldCalculator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CalculatorsPage = () => {
  const [activeCalc, setActiveCalc] = useState("pricing");

  const calculators = [
    {
      id: "pricing",
      name: "Pricing",
      fullName: "Pricing Calculator (Food Cost %)",
      icon: Percent,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: "yield",
      name: "Yield",
      fullName: "Yield & Waste Tool (EP vs. AP)",
      icon: ChevronRight,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "sandbox",
      name: "Plate Cost",
      fullName: "Plate Costing Sandbox",
      icon: Info,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      id: "turnover",
      name: "Turnover",
      fullName: "Inventory Health (Turnover)",
      icon: Calculator,
      color: "text-green-500 bg-green-500/10",
    },
    {
      id: "conversion",
      name: "Unit Cnv",
      fullName: "Unit Conversion Engine",
      icon: ArrowRightLeft,
      color: "text-pink-500 bg-pink-500/10",
    },
    {
      id: "labor",
      name: "Labor",
      fullName: "Labor-Inclusive Prime Cost",
      icon: Calculator,
      color: "text-cyan-500 bg-cyan-500/10",
    },
    {
      id: "simple_conversion",
      name: "Quick Cnv",
      fullName: "Simple Unit Converter",
      icon: ArrowRightLeft,
      color: "text-orange-500 bg-orange-500/10",
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

  const activeInfo = calculators.find((c) => c.id === activeCalc);

  return (
    <div className="flex flex-col h-full bg-background md:p-8 p-0">
      {/* Desktop Header */}
      {/* Desktop Header - REMOVED */}

      {/* Mobile Header & Selector */}
      <div className="md:hidden flex flex-col space-y-2 border-b bg-muted/20 pb-2">
        <div className="px-4 pt-4 pb-1 space-y-1">
          <h2 className="text-xl font-black tracking-tight text-primary uppercase">
            Kitchen Tools
          </h2>
          <p className="text-xs font-medium text-muted-foreground">
            Essential calculators for daily operations.
          </p>
        </div>

        {/* Horizontal Scroll Selector */}
        <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {calculators.map((calc) => {
              const isActive = activeCalc === calc.id;
              const Icon = calc.icon;
              return (
                <button
                  type="button"
                  key={calc.id}
                  onClick={() => setActiveCalc(calc.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 active:scale-95
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md font-bold"
                        : "bg-card hover:bg-muted/50 border-muted/50 text-muted-foreground font-medium"
                    }
                  `}
                >
                  <div
                    className={`p-1 rounded-full ${
                      isActive ? "bg-white/20" : calc.color
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-xs whitespace-nowrap">{calc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4 max-w-4xl p-4 md:p-0 flex-1 overflow-y-auto">
        {/* Desktop Selector */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm font-medium w-32">Select Tool:</span>
          <Select value={activeCalc} onValueChange={setActiveCalc}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a calculator" />
            </SelectTrigger>
            <SelectContent>
              {calculators.map((calc) => (
                <SelectItem key={calc.id} value={calc.id}>
                  <div className="flex items-center gap-2">
                    <calc.icon className="w-4 h-4 text-muted-foreground" />
                    {calc.fullName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Calculator Title (Mobile/Desktop Context) */}
        <div className="md:hidden mb-2 flex items-center gap-2 mt-2">
          <div className={`p-2 rounded-xl ${activeInfo?.color}`}>
            {activeInfo?.icon && <activeInfo.icon className="w-4 h-4" />}
          </div>
          <h3 className="text-sm font-black uppercase text-foreground tracking-wide">
            {activeInfo?.fullName}
          </h3>
        </div>

        <div className="mt-0 md:mt-4">{renderCalculator()}</div>
      </div>
    </div>
  );
};
