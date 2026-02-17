import { BarChart3, TrendingUp, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisTab } from "../tabs/AnalysisTab";
import { ExpensesTab } from "../tabs/ExpensesTab";
import { IncomeTab } from "../tabs/IncomeTab";

export function FinanceDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Aggregator
          </h1>
          <p className="text-muted-foreground">
            Manage Expenses, Track Income, and Analyze Profitability.
          </p>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="expenses">
            <Wallet className="mr-2 h-4 w-4" /> Expenses & Labor
          </TabsTrigger>
          <TabsTrigger value="income">
            <TrendingUp className="mr-2 h-4 w-4" /> Income
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="mr-2 h-4 w-4" /> Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab />
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <IncomeTab />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
