import { ClipboardList, Eye, History, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PrepSheetBuilder } from "@/components/organisms/PrepSheetBuilder";
import { PrepSheetView } from "@/components/organisms/PrepSheetView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard, DataCardList } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { usePrepSheetsStore } from "@/modules/core/prep-sheets/store/prep-sheets.store";
import type { PrepSheet } from "@/modules/core/prep-sheets/types";

export const PrepSheetsPage = () => {
  const {
    prepSheets,
    fetchPrepSheets,
    generateSheet,
    saveSheet,
    deleteSheet,
    clearBuilder,
    isLoading,
    notification,
    clearNotification,
  } = usePrepSheetsStore();
  const { t } = useTranslation();

  const [viewingSheet, setViewingSheet] = useState<PrepSheet | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrepSheets();
  }, [fetchPrepSheets]);

  // Handle building-in simple notification clearing
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => clearNotification(), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

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
      setActiveTab("saved"); // Switch to saved sheets tab
    }
  };

  const filteredPrepSheets = prepSheets.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    if (confirm("Delete this prep sheet?")) {
      await deleteSheet(id);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 md:p-8 pt-6">
      <div className="flex-1 flex flex-col px-4 md:px-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col space-y-4"
        >
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="create" className="flex-1 md:flex-none">
              {t("prepSheets.createNew")}
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex-1 md:flex-none">
              <History className="mr-2 h-4 w-4" />
              {t("prepSheets.savedSheets")} ({prepSheets.length})
            </TabsTrigger>
          </TabsList>

          {notification && (
            <div
              className={`p-4 rounded-md flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-4 ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              } border`}
            >
              <span>{notification.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotification}
                className="h-auto p-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <TabsContent value="create" className="space-y-4 flex-1">
            <PrepSheetBuilder
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 flex-1">
            {/* Search for Saved Sheets */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.labels.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {prepSheets.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-muted/10">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-medium">
                  {t("prepSheets.noSavedSheets")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("prepSheets.generatePrompt")}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile List View */}
                <div className="md:hidden">
                  <DataCardList
                    items={filteredPrepSheets}
                    emptyMessage={t("prepSheets.noSavedSheets")}
                    renderItem={(sheet) => (
                      <DataCard
                        key={sheet.id}
                        title={sheet.name}
                        subtitle={new Date(sheet.date).toLocaleDateString()}
                        onClick={() => setViewingSheet(sheet)}
                        actions={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              // biome-ignore lint/style/noNonNullAssertion: ID is guaranteed
                              handleDelete(sheet.id!);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        details={[
                          {
                            label: "Shift",
                            value: sheet.shift ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5"
                              >
                                {sheet.shift}
                              </Badge>
                            ) : (
                              "-"
                            ),
                          },
                          {
                            label: "Recipes",
                            value: `${sheet.recipes.length} recipes`,
                          },
                        ]}
                      />
                    )}
                  />
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.labels.name")}</TableHead>
                        <TableHead>{t("common.labels.date")}</TableHead>
                        <TableHead>{t("prepSheets.shift")}</TableHead>
                        <TableHead>{t("prepSheets.recipes")}</TableHead>
                        <TableHead className="text-right">
                          {t("prepSheets.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrepSheets.map((sheet) => (
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
                                <Eye className="h-4 w-4 mr-1" />{" "}
                                {t("prepSheets.view")}
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

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
