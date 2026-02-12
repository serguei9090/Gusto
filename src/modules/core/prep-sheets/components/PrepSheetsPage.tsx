import { ClipboardList, Eye, History, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "@/hooks/useTranslation";
import { useMobileComponent } from "@/lib/mobile-registry";
import { usePrepSheetsStore } from "@/modules/core/prep-sheets/store/prep-sheets.store";
import type { PrepSheet } from "@/modules/core/prep-sheets/types";
import { PrepSheetBuilder } from "./PrepSheetBuilder";
import { PrepSheetView } from "./PrepSheetView";

export const PrepSheetsPage = () => {
  const isMobile = useMobile();
  const MobileComponent = useMobileComponent("MobilePrepSheets");
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
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
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
      setIsBuilderOpen(false);
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

  if (isMobile && MobileComponent) {
    return (
      <div className="h-full">
        <MobileComponent
          prepSheets={filteredPrepSheets}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsBuilderOpen={setIsBuilderOpen}
          setViewingSheet={setViewingSheet}
          handleDelete={handleDelete}
          notification={notification}
          clearNotification={clearNotification}
          t={t}
        />

        {/* Builder Dialog for Mobile */}
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogContent className="w-full max-w-full rounded-none border-x-0 p-4 pt-6 top-16 translate-y-0 h-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("prepSheets.createNew")}</DialogTitle>
              <DialogDescription>
                Select recipes and servings to generate a new prep list.
              </DialogDescription>
            </DialogHeader>
            <PrepSheetBuilder
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>

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
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("prepSheets.title")}
          </h2>
          <p className="text-muted-foreground">{t("prepSheets.subtitle")}</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="create">{t("prepSheets.createNew")}</TabsTrigger>
          <TabsTrigger value="saved">
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

        <TabsContent value="create" className="space-y-4">
          <PrepSheetBuilder onGenerate={handleGenerate} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="saved">
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
            <div className="rounded-md border bg-card">
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
