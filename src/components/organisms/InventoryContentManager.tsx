import { AlertCircle, History } from "lucide-react";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";
import { AssetTable } from "./AssetTable";
import { InventoryTable } from "./InventoryTable";

interface InventoryContentManagerProps {
  activeTab: "consumables" | "assets";
  setActiveTab: (tab: "consumables" | "assets") => void;
  filteredIngredients: Ingredient[];
  filteredAssets: Asset[];
  handleEditItem: (
    item: Ingredient | Asset,
    type: "consumables" | "assets",
  ) => void;
  openHistoryModal: (item: Ingredient | Asset) => void;
  setSearchQuery: (query: string) => void;
}

export const InventoryContentManager = ({
  activeTab,
  setActiveTab,
  filteredIngredients,
  filteredAssets,
  handleEditItem,
  openHistoryModal,
  setSearchQuery,
}: InventoryContentManagerProps) => {
  return (
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
                              <StatusBadge
                                type="error"
                                label="Low Stock"
                                icon={AlertCircle}
                              />
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
                        <StatusBadge
                          type="info"
                          label={asset.assetType}
                          variant="subtle"
                          className="capitalize"
                        />
                      ),
                    },
                    ...(isLow
                      ? [
                          {
                            label: "Status",
                            value: (
                              <StatusBadge
                                type="error"
                                label="Low Stock"
                                icon={AlertCircle}
                              />
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

        <div className="hidden md:block flex-1 overflow-auto bg-card rounded-md border text-sm">
          <AssetTable
            assets={filteredAssets}
            onEdit={(asset) => handleEditItem(asset, "assets")}
            onViewHistory={openHistoryModal}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
