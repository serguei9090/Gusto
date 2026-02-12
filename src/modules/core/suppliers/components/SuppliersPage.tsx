import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import { useSuppliersStore } from "@/modules/core/suppliers/store/suppliers.store";
import type {
  Supplier,
  SupplierFormData,
} from "@/modules/core/suppliers/types";
import { SupplierDetailModal } from "./SupplierDetailModal";
import { SupplierForm } from "./SupplierForm";
import { SupplierTable } from "./SupplierTable";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseForm();
        setViewingSupplier(null);
      }
    };
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, [handleCloseForm]);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateOrUpdate = async (data: SupplierFormData) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
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
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 p-4 md:p-8 pb-24 md:pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("suppliers.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("suppliers.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> {t("suppliers.addSupplier")}
        </Button>
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
            <p className="text-xs text-muted-foreground">
              {t("suppliers.activePartners")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="hidden md:block" />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 md:max-w-sm">
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

      {/* Mobile ListView */}
      <div className="md:hidden">
        <DataCardList
          items={filteredSuppliers}
          emptyMessage={t("common.messages.noData")}
          renderItem={(supplier) => (
            <DataCard
              key={supplier.id}
              title={supplier.name}
              subtitle={supplier.contactPerson || "No contact person"}
              onEdit={() => handleEdit(supplier)}
              onDelete={() => handleDelete(supplier.id)}
              onClick={() => handleView(supplier)}
              details={[
                {
                  label: "Contact",
                  value: (
                    <div className="flex flex-col gap-1 mt-1">
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="h-3 w-3 text-primary" />
                          <span className="font-medium">{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3 w-3 text-primary" />
                          <span className="font-medium truncate max-w-[150px]">
                            {supplier.email}
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  label: "Location",
                  value: (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium truncate max-w-[100px]">
                        {supplier.address || "N/A"}
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          )}
        />
        {filteredSuppliers.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-base">{t("common.messages.noData")}</p>
          </div>
        )}
      </div>

      {/* Desktop TableView */}
      <div className="hidden md:block flex-1 overflow-auto bg-card rounded-md border shadow-sm">
        <SupplierTable
          suppliers={filteredSuppliers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <SupplierForm
        initialData={editingSupplier}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateOrUpdate}
        isLoading={isLoading}
      />

      {viewingSupplier && (
        <SupplierDetailModal
          supplier={viewingSupplier}
          onClose={() => setViewingSupplier(null)}
        />
      )}
    </div>
  );
};
