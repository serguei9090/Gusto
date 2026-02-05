import { Plus, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSuppliersStore } from "@/features/suppliers/store/suppliers.store";
import type { Supplier } from "@/features/suppliers/types";
import { SupplierForm } from "./SupplierForm";
import { SupplierTable } from "./SupplierTable";
import { useTranslation } from "@/hooks/useTranslation";

export const SuppliersPage = () => {
  const {
    suppliers,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isLoading,
    error,
  } = useSuppliersStore();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // biome-ignore lint/suspicious/noExplicitAny: Form data
  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, data);
      } else {
        await createSupplier(data);
      }
      handleCloseForm();
    } catch (err) {
      console.error("Operation failed:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete supplier");
      }
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleValuesChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setSelectedSupplier(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("suppliers.title")}</h2>
          <p className="text-muted-foreground">
            {t("suppliers.subtitle")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("suppliers.addSupplier")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("suppliers.totalSuppliers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">{t("suppliers.activePartners")}</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("suppliers.searchPlaceholder")}
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
        <SupplierTable
          suppliers={filteredSuppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <SupplierForm
        initialData={selectedSupplier}
        open={isFormOpen}
        onOpenChange={handleValuesChange}
        onSubmit={handleCreateOrUpdate}
        isLoading={isLoading}
      />
    </div>
  );
};
