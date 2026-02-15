import { ArrowLeftRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryActionBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "consumables" | "assets";
  onAddItem: () => void;
  onRecordTransaction: () => void;
}

export const InventoryActionBar = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  onAddItem,
  onRecordTransaction,
}: InventoryActionBarProps) => {
  return (
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
        onClick={onAddItem}
        className="flex items-center gap-2"
        variant="secondary"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Item</span>
      </Button>
      <Button onClick={onRecordTransaction} className="flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4" />
        <span className="hidden sm:inline">Record Transaction</span>
      </Button>
    </div>
  );
};
