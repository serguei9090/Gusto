import { Percent, Receipt, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpensesStore } from "../../store/expenses.store";
import { useLaborRatesStore } from "../../store/laborRates.store";
import { CurrencyDisplay } from "../atoms/CurrencyDisplay";
import { FixedExpensesTable } from "../FixedExpensesTable";
import { LaborRatesSettings } from "../LaborRatesSettings";
import { VariableExpensesTable } from "../VariableExpensesTable";

export function ExpensesTab() {
  const { fixedExpenses, variableExpenses, loadExpenses } = useExpensesStore();
  const { rates, loadRates } = useLaborRatesStore();

  useEffect(() => {
    loadExpenses();
    loadRates();
  }, [loadExpenses, loadRates]);

  const totalMonthlyFixedCost = useMemo(() => {
    return fixedExpenses.reduce((sum, expense) => {
      if (!expense.is_active) return sum;
      if (expense.period === "Yearly") {
        return sum + expense.amount / 12;
      }
      return sum + expense.amount; // Monthly
    }, 0);
  }, [fixedExpenses]);

  const variablePercent = useMemo(() => {
    const percents = variableExpenses.filter(
      (e) => e.type === "PercentOfSales" && e.is_active,
    );
    if (percents.length === 0) return 0;
    return percents.reduce((sum, e) => sum + e.rate, 0);
  }, [variableExpenses]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fixed Cost
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={totalMonthlyFixedCost} />
            </div>
            <p className="text-xs text-muted-foreground">Per Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Variable Burdens
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {variablePercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Combined Sales %</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rates.length}</div>
            <p className="text-xs text-muted-foreground">Active Specialists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed Items</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixedExpenses.length}</div>
            <p className="text-xs text-muted-foreground">Recurring Bills</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fixed" className="w-full">
        <TabsList>
          <TabsTrigger value="fixed">Fixed Expenses</TabsTrigger>
          <TabsTrigger value="variable">Variable Expenses</TabsTrigger>
          <TabsTrigger value="labor">Labor Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fixed Expenses</CardTitle>
              <CardDescription>
                Recurring costs like Rent, Insurance, Software subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixedExpensesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variable" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Variable Expenses</CardTitle>
              <CardDescription>
                Costs that scale with sales (Utilities as % of Sales).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariableExpensesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Labor Roles & Rates</CardTitle>
              <CardDescription>
                Define hourly rates for your staff. These are used in recipe
                costing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LaborRatesSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
