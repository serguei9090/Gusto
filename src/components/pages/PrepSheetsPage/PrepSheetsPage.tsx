import { useState, useEffect } from "react";
import { ClipboardList, History } from "lucide-react";
import { usePrepSheetStore } from "@/store/prepSheetStore";
import { PrepSheetBuilder } from "@/components/organisms/PrepSheetBuilder";
import { PrepSheetView } from "@/components/organisms/PrepSheetView";
import { Button } from "@/components/atoms/Button";
import type { PrepSheetFormData, PrepSheet } from "@/types/prepSheet.types";
import styles from "./PrepSheetsPage.module.css";

type Tab = "create" | "saved";

export const PrepSheetsPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>("create");
    const [viewingSheet, setViewingSheet] = useState<PrepSheet | null>(null);

    const {
        prepSheets,
        isLoading,
        fetchPrepSheets,
        generateSheet,
        saveSheet,
        deleteSheet,
        setCurrentSheet,
        clearBuilder
    } = usePrepSheetStore();

    useEffect(() => {
        fetchPrepSheets();
    }, [fetchPrepSheets]);

    const handleGenerate = async (formData: PrepSheetFormData) => {
        const sheet = await generateSheet(formData);
        setViewingSheet(sheet);
    };

    const handleSave = async () => {
        if (!viewingSheet) return;
        await saveSheet(viewingSheet);
        clearBuilder();
        setViewingSheet(null);
        setActiveTab("saved");
    };

    const handleViewSaved = (sheet: PrepSheet) => {
        setViewingSheet(sheet);
    };

    const handleDelete = async (id: number) => {
        if (globalThis.confirm("Delete this prep sheet?")) {
            await deleteSheet(id);
        }
    };

    const handleCloseView = () => {
        setViewingSheet(null);
        setCurrentSheet(null);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1><ClipboardList size={28} /> Prep Sheets</h1>
            </header>

            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === "create" ? styles.active : ""}`}
                    onClick={() => setActiveTab("create")}
                >
                    Create New
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === "saved" ? styles.active : ""}`}
                    onClick={() => setActiveTab("saved")}
                >
                    <History size={16} /> Saved Sheets ({prepSheets.length})
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === "create" && (
                    <PrepSheetBuilder onGenerate={handleGenerate} isLoading={isLoading} />
                )}

                {activeTab === "saved" && (
                    <div className={styles.savedList}>
                        {prepSheets.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ClipboardList size={48} />
                                <p>No saved prep sheets yet.</p>
                                <Button variant="primary" onClick={() => setActiveTab("create")}>
                                    Create Your First
                                </Button>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Shift</th>
                                        <th>Recipes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prepSheets.map(sheet => (
                                        <tr key={sheet.id}>
                                            <td className={styles.nameCell}>{sheet.name}</td>
                                            <td>{formatDate(sheet.date)}</td>
                                            <td>{sheet.shift || "—"}</td>
                                            <td>{sheet.recipes.length} recipes</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewSaved(sheet)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => sheet.id && handleDelete(sheet.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {viewingSheet && (
                <PrepSheetView
                    sheet={viewingSheet}
                    onClose={handleCloseView}
                    onSave={handleSave}
                    showSaveButton={!viewingSheet.id}
                />
            )}
        </div>
    );
};
