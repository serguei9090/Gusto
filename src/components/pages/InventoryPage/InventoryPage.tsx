import { useEffect, useState } from "react";
import { useIngredientStore } from "@/store/ingredientStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { InventoryTable } from "@/components/organisms/InventoryTable";
import { TransactionModal } from "@/components/organisms/TransactionModal";
import { StatCard } from "@/components/molecules/StatCard";
import { SearchBar } from "@/components/molecules/SearchBar";
import styles from "./InventoryPage.module.css";
import type { Ingredient } from "@/types/ingredient.types";

export const InventoryPage = () => {
    const { ingredients, fetchIngredients } = useIngredientStore();
    const { logTransaction, fetchLowStockItems, lowStockItems, isLoading: loadingInv, error } = useInventoryStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

    useEffect(() => {
        fetchIngredients();
        fetchLowStockItems();
    }, [fetchIngredients, fetchLowStockItems]);

    const filteredIngredients = ingredients.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTransaction = async (data: any) => {
        try {
            await logTransaction(data);
            setSelectedIngredient(null);
        } catch (err) {
            console.error("Transaction failed:", err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.stats}>
                <StatCard
                    label="Total Ingredients"
                    value={ingredients.length.toString()}
                />
                <StatCard
                    label="Low Stock Items"
                    value={lowStockItems.length.toString()}
                />
            </div>

            <div className={styles.toolbar}>
                <SearchBar
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <InventoryTable
                ingredients={filteredIngredients}
                onRecordTransaction={setSelectedIngredient}
            />

            {selectedIngredient && (
                <TransactionModal
                    ingredient={selectedIngredient}
                    onClose={() => setSelectedIngredient(null)}
                    onSubmit={handleTransaction}
                    isLoading={loadingInv}
                />
            )}
        </div>
    );
};
