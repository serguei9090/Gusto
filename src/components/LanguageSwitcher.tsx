import { useTranslation } from "@/hooks/useTranslation";
import { LANGUAGE_INFO, type Language, SUPPORTED_LANGUAGES } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value as Language)}
        className="px-3 py-1.5 text-sm rounded-md border border-input bg-background"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_INFO[lang].nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
