import { ClipboardList, Eye, History, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrepSheetsStore } from "@/features/prep-sheets/store/prep-sheets.store";
import type { PrepSheet } from "@/features/prep-sheets/types";
import { PrepSheetBuilder } from "./PrepSheetBuilder";
import { PrepSheetView } from "./PrepSheetView";
import { useTranslation } from "@/hooks/useTranslation";

export const PrepSheetsPage = () => {
  const {
    prepSheets,
    fetchPrepSheets,
    generateSheet,
    saveSheet,
    deleteSheet,
    clearBuilder,
    isLoading,
  } = usePrepSheetsStore();
  const { t } = useTranslation();

  const [viewingSheet, setViewingSheet] = useState<PrepSheet | null>(null);

  useEffect(() => {
    fetchPrepSheets();
  }, [fetchPrepSheets]);

  // biome-ignore lint/suspicious/noExplicitAny: Form data type
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
          <h2 className="text-3xl font-bold tracking-tight">
            {t("prepSheets.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("prepSheets.subtitle")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">{t("prepSheets.createNew")}</TabsTrigger>
          <TabsTrigger value="saved">
            <History className="mr-2 h-4 w-4" />
            {t("prepSheets.savedSheets")} ({prepSheets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <PrepSheetBuilder onGenerate={handleGenerate} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="saved">
          {prepSheets.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium">{t("prepSheets.noSavedSheets")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("prepSheets.generatePrompt")}
              </p>
            </div>
          ) : (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.labels.name")}</TableHead>
                    <TableHead>{t("common.labels.date")}</TableHead>
                    <TableHead>{t("prepSheets.shift")}</TableHead>
                    <TableHead>{t("prepSheets.recipes")}</TableHead>
                    <TableHead className="text-right">{t("prepSheets.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prepSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell className="font-medium">
                        {sheet.name}
                      </TableCell>
                      <TableCell>
                        {new Date(sheet.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sheet.shift ? (
                          <Badge variant="outline" className="capitalize">
                            {sheet.shift}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{sheet.recipes.length} recipes</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingSheet(sheet)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> {t("prepSheets.view")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            // biome-ignore lint/style/noNonNullAssertion: ID is guaranteed
                            onClick={() => handleDelete(sheet.id!)}
                            className="text-destructive"
                          >
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
