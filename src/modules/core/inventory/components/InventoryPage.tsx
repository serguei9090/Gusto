import { AlertTriangle, Package, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import { useInventoryStore } from "@/modules/core/inventory/store/inventory.store";
import type { Ingredient } from "@/types/ingredient.types";
import { InventoryHistoryModal } from "./InventoryHistoryModal";
import { InventoryTable } from "./InventoryTable";
import { TransactionModal } from "./TransactionModal";

export const InventoryPage = () => {
  const { ingredients, fetchIngredients } = useIngredientsStore();
  const {
    logTransaction,
    fetchLowStockItems,
    lowStockItems,
    isLoading: loadingInv,
    error,
  } = useInventoryStore();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [historyIngredient, setHistoryIngredient] = useState<Ingredient | null>(
    null,
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    fetchIngredients();
    fetchLowStockItems();
  }, [fetchIngredients, fetchLowStockItems]);

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // biome-ignore lint/suspicious/noExplicitAny: Form data type
  const handleTransaction = async (data: any) => {
    try {
      await logTransaction(data);
      setIsModalOpen(false);
      setSelectedIngredient(null);
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const openTransactionModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const openHistoryModal = (ingredient: Ingredient) => {
    setHistoryIngredient(ingredient);
    setIsHistoryOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("inventory.title")}
          </h2>
          <p className="text-muted-foreground">{t("inventory.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inventory.totalItems")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("inventory.activeIngredients")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("inventory.lowStock")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("inventory.itemsNeedingAttention")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("inventory.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto bg-card rounded-md border">
        <InventoryTable
          ingredients={filteredIngredients}
          onRecordTransaction={openTransactionModal}
          onViewHistory={openHistoryModal}
        />
      </div>

      {selectedIngredient && (
        <TransactionModal
          ingredient={selectedIngredient}
          open={isModalOpen}
          onOpenChange={(val) => {
            setIsModalOpen(val);
            if (!val) setSelectedIngredient(null);
          }}
          onSubmit={handleTransaction}
          isLoading={loadingInv}
        />
      )}

      {historyIngredient && (
        <InventoryHistoryModal
          ingredient={historyIngredient}
          open={isHistoryOpen}
          onOpenChange={(val) => {
            setIsHistoryOpen(val);
            if (!val) setHistoryIngredient(null);
          }}
        />
      )}
    </div>
  );
};
