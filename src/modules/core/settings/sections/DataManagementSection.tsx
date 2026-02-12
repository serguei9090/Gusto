import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { backupService } from "@/lib/services/backup.service";

export const DataManagementSection = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await backupService.exportDatabase();
      if (result === "success") {
        toast.success(t("settings.dataManagement.exportSuccess"));
      } else if (result !== "cancelled") {
        toast.error("Export failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!confirm(t("settings.dataManagement.importWarning"))) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await backupService.importDatabase();
      if (result.success) {
        toast.success(t("settings.dataManagement.importSuccess"));
        // Short delay to let toast show, then reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (result.message !== "cancelled") {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.dataManagement.title")}</CardTitle>
        <CardDescription>
          {t("settings.dataManagement.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-medium">Export</h4>
            <p className="text-sm text-muted-foreground">
              {t("settings.dataManagement.exportHelp")}
            </p>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full justify-start"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting
                ? t("common.messages.saving")
                : t("settings.dataManagement.export")}
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-medium">Import</h4>
            <p className="text-sm text-muted-foreground">
              {t("settings.dataManagement.importHelp")}
            </p>
            <Button
              variant="outline"
              onClick={handleImport}
              disabled={isImporting}
              className="w-full justify-start"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting
                ? t("common.messages.loading")
                : t("settings.dataManagement.import")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
