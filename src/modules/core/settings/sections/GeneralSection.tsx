import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

export const GeneralSection = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.general.title")}</CardTitle>
        <CardDescription>{t("settings.general.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-x-2 sm:space-y-0">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="language">
              {t("settings.general.languageLabel")}
            </Label>
            <span className="text-sm text-muted-foreground">
              {t("settings.general.languageHelp")}
            </span>
          </div>
          <Select
            value={currentLanguage}
            onValueChange={(val) => changeLanguage(val as "en" | "es" | "fr")}
          >
            <SelectTrigger className="w-full h-12 sm:w-[180px] sm:h-10">
              <SelectValue placeholder={t("settings.general.selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
