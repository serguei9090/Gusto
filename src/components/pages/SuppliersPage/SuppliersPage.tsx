import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSupplierStore } from "@/store/supplierStore";
import { SupplierTable } from "@/components/organisms/SupplierTable";
import { SupplierForm } from "@/components/organisms/SupplierForm";
import { Button } from "@/components/atoms/Button";
import { SearchBar } from "@/components/molecules/SearchBar";
import type { Supplier } from "@/types/ingredient.types";
import styles from "./SuppliersPage.module.css";

export const SuppliersPage = () => {
    const {
        suppliers,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        isLoading,
        error
    } = useSupplierStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCreateOrUpdate = async (data: any) => {
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

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingSupplier(null);
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

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.searchArea}>
                    <SearchBar
                        placeholder="Search suppliers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus size={18} />
                    Add Supplier
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {filteredSuppliers.length > 0 ? (
                <SupplierTable
                    suppliers={filteredSuppliers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className={styles.emptyState}>
                    <p>No suppliers found. Add your first supplier to get started.</p>
                </div>
            )}

            {isFormOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{editingSupplier ? "Edit Supplier" : "New Supplier"}</h2>
                        </div>
                        <SupplierForm
                            onSubmit={handleCreateOrUpdate}
                            initialData={editingSupplier}
                            onCancel={handleCloseForm}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
