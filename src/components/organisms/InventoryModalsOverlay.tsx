import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Asset, CreateAssetInput } from "@/types/asset.types";
import type {
  CreateIngredientInput,
  Ingredient,
} from "@/types/ingredient.types";
import type { InventoryTransactionInput } from "@/utils/validators";
import { AssetForm } from "./AssetForm";
import { IngredientForm } from "./IngredientForm";
import { InventoryHistoryModal } from "./InventoryHistoryModal";
import { LowStockModal } from "./LowStockModal";
import { TransactionModal } from "./TransactionModal";

interface InventoryModalsOverlayProps {
  // Add/Edit State
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingItem: Ingredient | Asset | null;
  setEditingItem: (item: Ingredient | Asset | null) => void;
  addModalTab: "consumables" | "assets";
  setAddModalTab: (tab: "consumables" | "assets") => void;
  handleCreateOrUpdateIngredient: (
    data: CreateIngredientInput,
  ) => Promise<void>;
  handleCreateOrUpdateAsset: (data: CreateAssetInput) => Promise<void>;
  loadingIng: boolean;
  loadingAsset: boolean;

  // Transaction State
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  selectedItem: Ingredient | Asset | null;
  setSelectedItem: (item: Ingredient | Asset | null) => void;
  handleTransaction: (data: InventoryTransactionInput) => Promise<void>;
  loadingInv: boolean;

  // History State
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  historyItem: Ingredient | Asset | null;
  setHistoryItem: (item: Ingredient | Asset | null) => void;

  // Low Stock State
  isLowStockOpen: boolean;
  setIsLowStockOpen: (open: boolean) => void;
  lowStockItems: (Ingredient | Asset)[];

  // Breakdown State
  showTotalDetails: boolean;
  setShowTotalDetails: (show: boolean) => void;
  showValueDetails: boolean;
  setShowValueDetails: (show: boolean) => void;

  // Data for breakdown
  ingredientsCount: number;
  assetsCount: number;
  totalItems: number;
  ingredientsValue: number;
  assetsValue: number;
  totalValue: number;
}

export const InventoryModalsOverlay = ({
  isAddModalOpen,
  setIsAddModalOpen,
  editingItem,
  setEditingItem,
  addModalTab,
  setAddModalTab,
  handleCreateOrUpdateIngredient,
  handleCreateOrUpdateAsset,
  loadingIng,
  loadingAsset,
  isTransactionModalOpen,
  setIsTransactionModalOpen,
  selectedItem,
  setSelectedItem,
  handleTransaction,
  loadingInv,
  isHistoryOpen,
  setIsHistoryOpen,
  historyItem,
  setHistoryItem,
  isLowStockOpen,
  setIsLowStockOpen,
  lowStockItems,
  showTotalDetails,
  setShowTotalDetails,
  showValueDetails,
  setShowValueDetails,
  ingredientsCount,
  assetsCount,
  totalItems,
  ingredientsValue,
  assetsValue,
  totalValue,
}: InventoryModalsOverlayProps) => {
  return (
    <>
      {/* Add/Edit Item Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(v) => {
          setIsAddModalOpen(v);
          if (!v) setEditingItem(null);
        }}
      >
        <DialogContent className="fixed left-0 top-[calc(64px+env(safe-area-inset-top))] z-[200] w-full h-[calc(100dvh-(64px+env(safe-area-inset-top)))] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background sm:fixed sm:left-[50%] sm:top-[50%] sm:z-[200] sm:w-full sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-0 flex flex-col gap-0 overflow-hidden">
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
                    Consumable
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="flex-1">
                    Asset
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

      {/* Transaction Modal */}
      <TransactionModal
        item={selectedItem}
        itemType={
          selectedItem && "assetType" in selectedItem
            ? "asset"
            : selectedItem
              ? "ingredient"
              : undefined
        }
        open={isTransactionModalOpen}
        onOpenChange={(val) => {
          setIsTransactionModalOpen(val);
          if (!val) setSelectedItem(null);
        }}
        onSubmit={handleTransaction}
        isLoading={loadingInv}
      />

      {/* History Modal */}
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

      {/* Low Stock Modal */}
      <LowStockModal
        open={isLowStockOpen}
        onOpenChange={setIsLowStockOpen}
        items={lowStockItems}
      />

      {/* Breakdown Modals */}
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
              <span className="text-xl font-bold">{ingredientsCount}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">Assets</span>
              </div>
              <span className="text-xl font-bold">{assetsCount}</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center px-4">
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
            <div className="pt-4 border-t flex justify-between items-center text-lg px-4">
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
    </>
  );
};
