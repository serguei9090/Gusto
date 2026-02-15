import { Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIngredientsStore } from "@/modules/core/ingredients/store/ingredients.store";
import { useAssetsStore } from "@/modules/core/inventory/store/assets.store";
import type { Asset } from "@/types/asset.types";
import type { Ingredient } from "@/types/ingredient.types";

interface ItemSelectorProps {
  onSelect: (item: Ingredient | Asset, type: "ingredient" | "asset") => void;
  onCancel: () => void;
}

export function ItemSelector({ onSelect, onCancel }: ItemSelectorProps) {
  const [activeTab, setActiveTab] = useState<"consumables" | "assets">(
    "consumables",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { ingredients } = useIngredientsStore();
  const { assets } = useAssetsStore();

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "consumables" | "assets")}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consumables">Consumables</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden mt-2 border rounded-md">
          <TabsContent value="consumables" className="h-full m-0">
            <ScrollArea className="h-[300px] md:h-[400px]">
              {filteredIngredients.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No ingredients found matching "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y">
                  {filteredIngredients.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => onSelect(item, "ingredient")}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.currentStock} {item.unitOfMeasure} available
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {item.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="assets" className="h-full m-0">
            <ScrollArea className="h-[300px] md:h-[400px]">
              {filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No assets found matching "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAssets.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => onSelect(item, "asset")}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.currentStock} {item.unitOfMeasure} available
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.assetType}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
