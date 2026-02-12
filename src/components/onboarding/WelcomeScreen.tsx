import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { LANGUAGE_INFO, SUPPORTED_LANGUAGES } from "@/lib/i18n";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  const handleLanguageSelect = (lang: string) => {
    // @ts-expect-error
    changeLanguage(lang as Language);
    // @ts-expect-error
    setSelectedLang(lang as Language);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">👨‍🍳</span>
          </div>
          <CardTitle className="text-3xl font-bold">
            {t("welcome.title", "Welcome to Gusto")}
          </CardTitle>
          <CardDescription className="text-lg">
            {t(
              "welcome.subtitle",
              "Your complete kitchen management solution.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-center text-muted-foreground">
              {t("welcome.selectLanguage", "Select your language")}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Button
                  key={lang}
                  variant={selectedLang === lang ? "default" : "outline"}
                  className="w-full justify-between h-12 text-lg"
                  onClick={() => handleLanguageSelect(lang)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">
                      {lang === "en" ? "🇺🇸" : lang === "es" ? "🇪🇸" : "🇫🇷"}
                    </span>
                    {LANGUAGE_INFO[lang]?.nativeName}
                  </span>
                  {selectedLang === lang && <Check className="w-5 h-5" />}
                </Button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold animate-in fade-in slide-in-from-bottom-4 duration-1000"
            onClick={onComplete}
          >
            {t("welcome.getStarted", "Get Started")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
