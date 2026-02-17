import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryActionBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "consumables" | "assets";
  onAddItem: () => void;
  onRecordTransaction: (
    mode: "purchase" | "usage" | "waste" | "adjustment",
  ) => void;
  onLegacyTransaction: () => void;
}

export const InventoryActionBar = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  onAddItem,
  onRecordTransaction,
  onLegacyTransaction,
}: InventoryActionBarProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Desktop Quick Actions */}
      <div className="hidden md:flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRecordTransaction("purchase")}
          title="Log Purchase"
        >
          <ArrowUpFromLine className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRecordTransaction("usage")}
          title="Log Usage"
        >
          <ArrowDownToLine className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRecordTransaction("waste")}
          title="Log Waste"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRecordTransaction("adjustment")}
          title="Quick Count"
        >
          <ClipboardCheck className="h-4 w-4 text-orange-600" />
        </Button>
        <div className="h-6 w-px bg-border mx-2" />
        <Button
          variant="outline"
          size="sm"
          onClick={onLegacyTransaction}
          className="text-xs text-muted-foreground"
        >
          Legacy Form
        </Button>
      </div>

      <Button onClick={onAddItem}>
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>
  );
};
