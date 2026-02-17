import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LaborStep } from "../../types";

interface LaborStepsTableProps {
  steps: LaborStep[];
  onChange: (steps: LaborStep[]) => void;
  currencySymbol?: string;
}

import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLaborRatesStore } from "@/modules/core/finance/store/laborRates.store";

export function LaborStepsTable({
  steps,
  onChange,
  currencySymbol = "$",
}: LaborStepsTableProps) {
  const { rates, loadRates } = useLaborRatesStore();

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const addStep = (ratePreset?: (typeof rates)[0]) => {
    onChange([
      ...steps,
      {
        name: ratePreset?.name || "",
        workers: 1,
        time_minutes: 0,
        hourly_rate: ratePreset ? ratePreset.hourly_rate : 0,
        is_production: true,
        labor_rate_id: ratePreset?.id,
      },
    ]);
  };

  const updateStep = (
    index: number,
    field: keyof LaborStep,
    value: string | number | boolean | undefined,
  ) => {
    const newSteps = [...steps];
    // If rate is manually changed, decouple from preset?
    // For now, keep ID. Logic for update on load will handle it.
    if (field === "hourly_rate") {
      // Optional: warn or clear ID? Let's keep ID for now.
    }
    newSteps[index] = { ...newSteps[index], [field]: value } as LaborStep;
    onChange(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
  };

  const calculateStepCost = (step: LaborStep) => {
    const hours = step.time_minutes / 60;
    return step.workers * hours * step.hourly_rate;
  };

  const totalDirectLabor = steps.reduce(
    (sum, step) => sum + calculateStepCost(step),
    0,
  );
  const productionLabor = steps
    .filter((s) => s.is_production)
    .reduce((sum, s) => sum + calculateStepCost(s), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Description</TableHead>
              <TableHead className="w-[80px]">Workers</TableHead>
              <TableHead className="w-[100px]">Time (min)</TableHead>
              <TableHead className="w-[100px]">Rate/Hr</TableHead>
              <TableHead className="w-[100px] text-center">
                Production?
              </TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step, index) => (
              <TableRow key={`${step.name}-${index}`}>
                <TableCell>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(index, "name", e.target.value)}
                    placeholder="e.g. Prep"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={step.workers}
                    onChange={(e) =>
                      updateStep(index, "workers", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={step.time_minutes}
                    onChange={(e) =>
                      updateStep(index, "time_minutes", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={step.hourly_rate}
                    onChange={(e) =>
                      updateStep(index, "hourly_rate", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={step.is_production}
                    onCheckedChange={(checked) =>
                      updateStep(index, "is_production", !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currencySymbol}
                  {calculateStepCost(step).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Labor Step{" "}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => addStep()}>
              Custom Step
            </DropdownMenuItem>
            {rates.length > 0 && <div className="h-px bg-muted my-1" />}
            {rates.map((rate) => (
              <DropdownMenuItem key={rate.id} onClick={() => addStep(rate)}>
                <span>{rate.name}</span>
                <span className="ml-2 text-muted-foreground text-xs">
                  ({currencySymbol}
                  {rate.hourly_rate}/hr)
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-4 text-sm">
          <div className="text-muted-foreground">
            Production Base:{" "}
            <span className="font-medium text-foreground">
              {currencySymbol}
              {productionLabor.toFixed(2)}
            </span>
          </div>
          <div>
            Total Direct Labor:{" "}
            <span className="font-bold text-primary">
              {currencySymbol}
              {totalDirectLabor.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
