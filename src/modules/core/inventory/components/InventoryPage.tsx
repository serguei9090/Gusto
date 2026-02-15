import {
  ArrowLeftRight,
  DollarSign,
  Eye,
  History,
  Package,
  Plus,
  Search,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { IngredientForm } from "@/modules/core/ingredients/components/IngredientForm";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import { useAssetsStore } from "@/modules/core/inventory/store/assets.store";
import { useInventoryStore } from "@/modules/core/inventory/store/inventory.store";
import type {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/types/asset.types";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "@/types/ingredient.types";
import { calculateTotalWithConversions } from "@/utils/currencyConverter";
import type { InventoryTransactionInput } from "@/utils/validators";
import { AssetForm } from "./AssetForm";
import { AssetTable } from "./AssetTable";
import { InventoryHistoryModal } from "./InventoryHistoryModal";
import { InventoryTable } from "./InventoryTable";
import { LowStockModal } from "./LowStockModal";
import { TransactionModal } from "./TransactionModal";

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

  // Transaction Modal State
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add/Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<"consumables" | "assets">(
    "consumables",
  );
  const [editingItem, setEditingItem] = useState<Ingredient | Asset | null>(
    null,
  );

  // History Modal State
  const [historyItem, setHistoryItem] = useState<Ingredient | Asset | null>(
    null,
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLowStockOpen, setIsLowStockOpen] = useState(false);
  const [showTotalDetails, setShowTotalDetails] = useState(false);
  const [showValueDetails, setShowValueDetails] = useState(false);

  useEffect(() => {
    fetchIngredients();
    fetchAssets();
    fetchLowStockItems();
  }, [fetchIngredients, fetchAssets, fetchLowStockItems]);

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTransaction = async (data: InventoryTransactionInput) => {
    try {
      await logTransaction(data);
      setIsModalOpen(false);
      setSelectedIngredient(null);
      setSelectedAsset(null);
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const handleCreateOrUpdateIngredient = async (
    data: CreateIngredientInput,
  ) => {
    try {
      if (editingItem) {
        await updateIngredient(editingItem.id, data as UpdateIngredientInput);
      } else {
        await createIngredient(data);
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save ingredient:", err);
    }
  };

  const handleCreateOrUpdateAsset = async (data: CreateAssetInput) => {
    try {
      if (editingItem) {
        await updateAsset(editingItem.id, data as UpdateAssetInput);
      } else {
        await createAsset(data);
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save asset:", err);
    }
  };

  const handleEditItem = (
    item: Ingredient | Asset,
    type: "consumables" | "assets",
  ) => {
    setEditingItem(item);
    setAddModalTab(type);
    setIsAddModalOpen(true);
  };

  const openGlobalTransactionModal = () => {
    setSelectedIngredient(null);
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const openHistoryModal = (item: Ingredient | Asset) => {
    setHistoryItem(item);
    setIsHistoryOpen(true);
  };

  const [ingredientsValue, setIngredientsValue] = useState(0);
  const [assetsValue, setAssetsValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

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

  const totalItems = ingredients.length + assets.length;

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-8 pt-6 md:pt-8">
      {/* Stats Cards */}
      {/* Compact Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* 1. Total Items Card */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors active:scale-95 duration-100"
          onClick={() => setShowTotalDetails(true)}
        >
          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
            <Package className="h-4 w-4 text-muted-foreground mb-1" />
            <div className="text-xl sm:text-2xl font-bold">{totalItems}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
              {t("inventory.totalItems")}
            </p>
          </CardContent>
        </Card>

        {/* 2. Low Stock Card */}
        <Card
          className={`cursor-pointer hover:bg-muted/50 transition-colors active:scale-95 duration-100 ${
            lowStockItems.length > 0
              ? "border-destructive/50 bg-destructive/5"
              : ""
          }`}
          onClick={() => setIsLowStockOpen(true)}
        >
          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
            <Eye
              className={`h-4 w-4 mb-1 ${
                lowStockItems.length > 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
            <div
              className={`text-xl sm:text-2xl font-bold ${
                lowStockItems.length > 0 ? "text-destructive" : ""
              }`}
            >
              {lowStockItems.length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
              {t("inventory.lowStock")}
            </p>
          </CardContent>
        </Card>

        {/* 3. Inventory Value Card */}
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors active:scale-95 duration-100"
          onClick={() => setShowValueDetails(true)}
        >
          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
            <DollarSign className="h-4 w-4 text-muted-foreground mb-1" />
            <div className="text-xl sm:text-2xl font-bold">
              {/* Use compact notation for mobile to prevent overflow (e.g. $12k) */}
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(totalValue)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
              Value
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Search and Transaction Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setAddModalTab(activeTab);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2"
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
        <Button
          onClick={openGlobalTransactionModal}
          className="flex items-center gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">Record Transaction</span>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Tabs for Consumables and Assets */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as "consumables" | "assets");
          setSearchQuery("");
        }}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="consumables" className="flex-1 sm:flex-initial">
            Consumables
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex-1 sm:flex-initial">
            Assets
          </TabsTrigger>
        </TabsList>

        {/* Consumables Tab */}
        <TabsContent value="consumables" className="flex-1 mt-4">
          {/* Mobile ListView */}
          <div className="md:hidden">
            <DataCardList
              items={filteredIngredients}
              emptyMessage="No ingredients found."
              renderItem={(ingredient) => {
                const isLow =
                  ingredient.minStockLevel !== null &&
                  ingredient.currentStock <= ingredient.minStockLevel;

                return (
                  <DataCard
                    key={ingredient.id}
                    title={ingredient.name}
                    subtitle={ingredient.category}
                    className={
                      isLow ? "border-destructive/50 bg-destructive/5" : ""
                    }
                    onEdit={() => handleEditItem(ingredient, "consumables")}
                    actions={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          openHistoryModal(ingredient);
                        }}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    }
                    details={[
                      {
                        label: "Stock",
                        value: (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${isLow ? "text-destructive" : ""}`}
                            >
                              {Number(ingredient.currentStock.toFixed(2))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ingredient.unitOfMeasure}
                            </span>
                          </div>
                        ),
                      },
                      {
                        label: "Value",
                        value: `$${(ingredient.currentStock * ingredient.pricePerUnit).toFixed(2)}`,
                      },
                      {
                        label: "Price",
                        value: `$${ingredient.pricePerUnit.toFixed(2)} / ${ingredient.unitOfMeasure}`,
                      },
                      ...(isLow
                        ? [
                            {
                              label: "Status",
                              value: (
                                <Badge
                                  variant="destructive"
                                  className="h-5 text-[10px] px-2 uppercase rounded-full"
                                >
                                  Low Stock
                                </Badge>
                              ),
                            },
                          ]
                        : []),
                    ]}
                  />
                );
              }}
            />
          </div>

          {/* Desktop TableView */}
          <div className="hidden md:block flex-1 overflow-auto bg-card rounded-md border text-sm">
            <InventoryTable
              ingredients={filteredIngredients}
              onEdit={(ing) => handleEditItem(ing, "consumables")}
              onViewHistory={openHistoryModal}
            />
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="flex-1 mt-4">
          {/* Mobile ListView */}
          <div className="md:hidden">
            <DataCardList
              items={filteredAssets}
              emptyMessage="No assets found."
              renderItem={(asset) => {
                const isLow =
                  asset.minStockLevel !== null &&
                  asset.currentStock <= asset.minStockLevel;

                return (
                  <DataCard
                    key={asset.id}
                    title={asset.name}
                    subtitle={asset.category}
                    className={
                      isLow ? "border-destructive/50 bg-destructive/5" : ""
                    }
                    onEdit={() => handleEditItem(asset, "assets")}
                    actions={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          openHistoryModal(asset);
                        }}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    }
                    details={[
                      {
                        label: "Stock",
                        value: (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${isLow ? "text-destructive" : ""}`}
                            >
                              {Number(asset.currentStock.toFixed(2))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {asset.unitOfMeasure}
                            </span>
                          </div>
                        ),
                      },
                      {
                        label: "Value",
                        value: `$${(asset.currentStock * asset.pricePerUnit).toFixed(2)}`,
                      },
                      {
                        label: "Price",
                        value: `$${asset.pricePerUnit.toFixed(2)} / ${asset.unitOfMeasure}`,
                      },
                      {
                        label: "Type",
                        value: (
                          <Badge
                            variant="secondary"
                            className="h-5 text-[10px] px-2 capitalize rounded-full"
                          >
                            {asset.assetType}
                          </Badge>
                        ),
                      },
                      ...(isLow
                        ? [
                            {
                              label: "Status",
                              value: (
                                <Badge
                                  variant="destructive"
                                  className="h-5 text-[10px] px-2 uppercase rounded-full"
                                >
                                  Low Stock
                                </Badge>
                              ),
                            },
                          ]
                        : []),
                    ]}
                  />
                );
              }}
            />
          </div>

          {/* Desktop Table for Assets */}
          <div className="hidden md:block flex-1 overflow-auto bg-card rounded-md border text-sm">
            <AssetTable
              assets={filteredAssets}
              onEdit={(asset) => handleEditItem(asset, "assets")}
              onViewHistory={openHistoryModal}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(v) => {
          setIsAddModalOpen(v);
          if (v) {
            setAddModalTab(activeTab); // Reset to active tab when opening new, but handleEditItem overrides this if editing
          } else {
            setEditingItem(null); // Clear editing item on close
          }
        }}
      >
        <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 border-b shrink-0">
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={addModalTab}
            onValueChange={(v) => setAddModalTab(v as "consumables" | "assets")}
            className="flex-1 flex flex-col min-h-0"
          >
            {!editingItem && (
              <div className="px-4 sm:px-6 py-2 border-b bg-muted/20">
                <TabsList className="w-full">
                  <TabsTrigger value="consumables" className="flex-1">
                    Consumable (Ingredient)
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="flex-1">
                    Asset (Equipment/Other)
                  </TabsTrigger>
                </TabsList>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <TabsContent
                value="consumables"
                className="mt-0 h-full flex flex-col"
              >
                <IngredientForm
                  defaultValues={editingItem as Partial<CreateIngredientInput>}
                  isEdit={!!editingItem}
                  onSubmit={handleCreateOrUpdateIngredient}
                  onCancel={() => setIsAddModalOpen(false)}
                  isLoading={loadingIng}
                />
              </TabsContent>

              <TabsContent value="assets" className="mt-0 h-full flex flex-col">
                <AssetForm
                  defaultValues={editingItem as Partial<CreateAssetInput>}
                  isEdit={!!editingItem}
                  onSubmit={handleCreateOrUpdateAsset}
                  onCancel={() => setIsAddModalOpen(false)}
                  isLoading={loadingAsset}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal - Always render if open, logic inside handles item selection */}
      <TransactionModal
        item={selectedIngredient || selectedAsset}
        itemType={
          selectedIngredient
            ? "ingredient"
            : selectedAsset
              ? "asset"
              : undefined
        }
        open={isModalOpen}
        onOpenChange={(val) => {
          setIsModalOpen(val);
          if (!val) {
            setSelectedIngredient(null);
            setSelectedAsset(null);
          }
        }}
        onSubmit={handleTransaction}
        isLoading={loadingInv}
      />

      {historyItem && (
        <InventoryHistoryModal
          item={historyItem}
          open={isHistoryOpen}
          onOpenChange={(val) => {
            setIsHistoryOpen(val);
            if (!val) setHistoryItem(null);
          }}
        />
      )}
      <LowStockModal
        open={isLowStockOpen}
        onOpenChange={setIsLowStockOpen}
        items={lowStockItems}
      />

      {/* Detail Modals */}
      <Dialog open={showTotalDetails} onOpenChange={setShowTotalDetails}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Inventory Breakdown</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">Ingredients</span>
              </div>
              <span className="text-xl font-bold">{ingredients.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">Assets</span>
              </div>
              <span className="text-xl font-bold">{assets.length}</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-muted-foreground">Total Items</span>
              <span className="text-2xl font-bold">{totalItems}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showValueDetails} onOpenChange={setShowValueDetails}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Value Breakdown</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Consumables</span>
              <span className="font-bold">
                $
                {ingredientsValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Assets/Equipment</span>
              <span className="font-bold">
                $
                {assetsValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center text-lg">
              <span className="font-semibold">Total Valuation</span>
              <span className="font-bold text-primary">
                $
                {totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
