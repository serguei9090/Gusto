import { useEffect, useState } from "react";
import { usePrepSheetsStore } from "@/features/prep-sheets/store/prep-sheets.store";
import { PrepSheetBuilder } from "./PrepSheetBuilder";
import { PrepSheetView } from "./PrepSheetView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, History, Eye, Trash2 } from "lucide-react";
import type { PrepSheet } from "@/features/prep-sheets/types";

export const PrepSheetsPage = () => {
    const {
        prepSheets,
        fetchPrepSheets,
        generateSheet,
        saveSheet,
        deleteSheet,
        clearBuilder,
        isLoading
    } = usePrepSheetsStore();

    const [viewingSheet, setViewingSheet] = useState<PrepSheet | null>(null);

    useEffect(() => {
        fetchPrepSheets();
    }, [fetchPrepSheets]);

    const handleGenerate = async (formData: any) => {
        const sheet = await generateSheet(formData);
        setViewingSheet(sheet);
    };

    const handleSave = async () => {
        if (viewingSheet) {
            await saveSheet(viewingSheet);
            setViewingSheet(null);
            clearBuilder();
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Delete this prep sheet?")) {
            await deleteSheet(id);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-8 w-8" />
                        Prep Sheets
                    </h2>
                    <p className="text-muted-foreground">
                        Plan production and generate combined prep lists.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="create" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                    <TabsTrigger value="saved">
                        <History className="mr-2 h-4 w-4" />
                        Saved Sheets ({prepSheets.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                    <PrepSheetBuilder onGenerate={handleGenerate} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="saved">
                    {prepSheets.length === 0 ? (
                        <div className="text-center py-12 border rounded-md bg-muted/10">
                            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                            <h3 className="text-lg font-medium">No saved prep sheets</h3>
                            <p className="text-muted-foreground mb-4">Generate and save a prep sheet to see it here.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Recipes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prepSheets.map((sheet) => (
                                        <TableRow key={sheet.id}>
                                            <TableCell className="font-medium">{sheet.name}</TableCell>
                                            <TableCell>{new Date(sheet.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {sheet.shift ? (
                                                    <Badge variant="outline" className="capitalize">
                                                        {sheet.shift}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{sheet.recipes.length} recipes</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setViewingSheet(sheet)}>
                                                        <Eye className="h-4 w-4 mr-1" /> View
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sheet.id!)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {viewingSheet && (
                <PrepSheetView
                    sheet={viewingSheet}
                    onClose={() => setViewingSheet(null)}
                    onSave={handleSave}
                    showSaveButton={!viewingSheet.id} // Only show save if not already saved (has ID)
                />
            )}
        </div>
    );
};
