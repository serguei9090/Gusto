import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  DollarSign,
  Eye,
  Package,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { InventoryActionBar } from "@/components/molecules/InventoryActionBar";
import { StatCard } from "@/components/molecules/StatCard";
import { InventoryContentManager } from "@/components/organisms/InventoryContentManager";
import { InventoryModalsOverlay } from "@/components/organisms/InventoryModalsOverlay";
import {
  QuickTransactionDrawer,
  type TransactionMode,
} from "@/components/organisms/QuickTransactionDrawer";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import { useAssetsStore } from "@/modules/core/inventory/store/assets.store";
import { useInventoryStore } from "@/modules/core/inventory/store/inventory.store";
import type { Asset, UpdateAssetInput } from "@/types/asset.types";
import type {
  Ingredient,
  UpdateIngredientInput,
} from "@/types/ingredient.types";
import { calculateTotalWithConversions } from "@/utils/currencyConverter";
import type { InventoryTransactionInput } from "@/utils/validators";

export const InventoryPage = () => {
  const {
    ingredients,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    isLoading: loadingIng,
  } = useIngredientsStore();
  const {
    assets,
    fetchAssets,
    createAsset,
    updateAsset,
    isLoading: loadingAsset,
  } = useAssetsStore();
  const {
    logTransaction,
    fetchLowStockItems,
    lowStockItems,
    isLoading: loadingInv,
    error,
  } = useInventoryStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"consumables" | "assets">(
    "consumables",
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLowStockOpen, setIsLowStockOpen] = useState(false);
  const [showTotalDetails, setShowTotalDetails] = useState(false);
  const [showValueDetails, setShowValueDetails] = useState(false);

  // Quick Transaction State
  const [quickTransactionOpen, setQuickTransactionOpen] = useState(false);
  const [transactionMode, setTransactionMode] =
    useState<TransactionMode>("usage");
  const [isFabOpen, setIsFabOpen] = useState(false); // Mobile FAB Menu State

  // Modal Data State
  const [selectedItem, setSelectedItem] = useState<Ingredient | Asset | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<Ingredient | Asset | null>(
    null,
  );
  const [historyItem, setHistoryItem] = useState<Ingredient | Asset | null>(
    null,
  );
  const [addModalTab, setAddModalTab] = useState<"consumables" | "assets">(
    "consumables",
  );

  // Economic Data
  const [ingredientsValue, setIngredientsValue] = useState(0);
  const [assetsValue, setAssetsValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchIngredients();
    fetchAssets();
    fetchLowStockItems();
  }, [fetchIngredients, fetchAssets, fetchLowStockItems]);

  useEffect(() => {
    const calculateValues = async () => {
      const { total: ingTotal } = await calculateTotalWithConversions(
        ingredients.map((i) => ({
          amount: i.currentStock * i.pricePerUnit,
          currency: i.currency || "USD",
        })),
      );
      const { total: astTotal } = await calculateTotalWithConversions(
        assets.map((a) => ({
          amount: a.currentStock * a.pricePerUnit,
          currency: a.currency || "USD",
        })),
      );
      setIngredientsValue(ingTotal);
      setAssetsValue(astTotal);
      setTotalValue(ingTotal + astTotal);
    };
    calculateValues();
  }, [ingredients, assets]);

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTransaction = async (data: InventoryTransactionInput) => {
    await logTransaction(data);
    setIsModalOpen(false);
  };

  const handleEditItem = (
    item: Ingredient | Asset,
    type: "consumables" | "assets",
  ) => {
    setEditingItem(item);
    setAddModalTab(type);
    setIsAddModalOpen(true);
  };

  const openHistoryModal = (item: Ingredient | Asset) => {
    setHistoryItem(item);
    setIsHistoryOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-8 pt-6 md:pt-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          label={t("inventory.totalItems")}
          value={ingredients.length + assets.length}
          icon={Package}
          onClick={() => setShowTotalDetails(true)}
        />
        <StatCard
          label={t("inventory.lowStock")}
          value={lowStockItems.length}
          icon={Eye}
          className={
            lowStockItems.length > 0
              ? "border-destructive/50 bg-destructive/5"
              : ""
          }
          onClick={() => setIsLowStockOpen(true)}
        />
        <StatCard
          label="Value"
          value={new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
            notation: "compact",
          }).format(totalValue)}
          icon={DollarSign}
          onClick={() => setShowValueDetails(true)}
        />
      </div>

      <Separator />

      <InventoryActionBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        onAddItem={() => {
          setEditingItem(null);
          setAddModalTab(activeTab);
          setIsAddModalOpen(true);
        }}
        onRecordTransaction={(mode) => {
          setTransactionMode(mode);
          setQuickTransactionOpen(true);
        }}
        onLegacyTransaction={() => {
          setSelectedItem(null);
          setIsModalOpen(true);
        }}
      />

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <InventoryContentManager
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredIngredients={filteredIngredients}
        filteredAssets={filteredAssets}
        handleEditItem={handleEditItem}
        openHistoryModal={openHistoryModal}
        setSearchQuery={setSearchQuery}
      />

      <InventoryModalsOverlay
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        addModalTab={addModalTab}
        setAddModalTab={setAddModalTab}
        handleCreateOrUpdateIngredient={async (data) => {
          if (editingItem)
            await updateIngredient(
              editingItem.id,
              data as UpdateIngredientInput,
            );
          else await createIngredient(data);
          setIsAddModalOpen(false);
        }}
        handleCreateOrUpdateAsset={async (data) => {
          if (editingItem)
            await updateAsset(editingItem.id, data as UpdateAssetInput);
          else await createAsset(data);
          setIsAddModalOpen(false);
        }}
        loadingIng={loadingIng}
        loadingAsset={loadingAsset}
        isTransactionModalOpen={isModalOpen}
        setIsTransactionModalOpen={setIsModalOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handleTransaction={handleTransaction}
        loadingInv={loadingInv}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        historyItem={historyItem}
        setHistoryItem={setHistoryItem}
        isLowStockOpen={isLowStockOpen}
        setIsLowStockOpen={setIsLowStockOpen}
        lowStockItems={lowStockItems}
        showTotalDetails={showTotalDetails}
        setShowTotalDetails={setShowTotalDetails}
        showValueDetails={showValueDetails}
        setShowValueDetails={setShowValueDetails}
        ingredientsCount={ingredients.length}
        assetsCount={assets.length}
        totalItems={ingredients.length + assets.length}
        ingredientsValue={ingredientsValue}
        assetsValue={assetsValue}
        totalValue={totalValue}
      />

      <QuickTransactionDrawer
        open={quickTransactionOpen}
        onOpenChange={setQuickTransactionOpen}
        mode={transactionMode}
        onSuccess={() => {
          fetchIngredients(); // Refresh stock
          fetchAssets();
        }}
      />

      {/* Mobile Speed Dial / FABs */}
      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-3 z-40 md:hidden">
        {/* Secondary Actions (Visible when FAB is open) */}
        <div
          className={`flex flex-col gap-3 transition-all duration-200 ${isFabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        >
          <button
            type="button"
            onClick={() => {
              setTransactionMode("purchase");
              setQuickTransactionOpen(true);
              setIsFabOpen(false);
            }}
            className="h-12 w-12 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center"
            aria-label="Log Purchase"
          >
            <ArrowUpFromLine className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTransactionMode("adjustment");
              setQuickTransactionOpen(true);
              setIsFabOpen(false);
            }}
            className="h-12 w-12 rounded-full bg-orange-600 text-white shadow-lg flex items-center justify-center"
            aria-label="Quick Count"
          >
            <ClipboardCheck className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setTransactionMode("waste");
              setQuickTransactionOpen(true);
              setIsFabOpen(false);
            }}
            className="h-12 w-12 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center"
            aria-label="Log Waste"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Main Trigger FAB */}
        <button
          type="button"
          className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isFabOpen
              ? "bg-muted-foreground text-white"
              : "bg-primary text-primary-foreground"
          }`}
          onClick={() => setIsFabOpen(!isFabOpen)}
          aria-label="Quick Actions"
        >
          {isFabOpen ? (
            <ArrowDownToLine className="h-6 w-6 rotate-180 transition-transform" />
          ) : (
            <ArrowDownToLine className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
};
