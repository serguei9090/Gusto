import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import fr from "../locales/fr/translation.json";

export const defaultNS = "translation";
export const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
} as const;

// Define supported languages
export const SUPPORTED_LANGUAGES = ["en", "es", "fr"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// Language metadata
export const LANGUAGE_INFO: Record<
  Language,
  { name: string; nativeName: string }
> = {
  en: { name: "English", nativeName: "English" },
  es: { name: "Spanish", nativeName: "Español" },
  fr: { name: "French", nativeName: "Français" },
};

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
      fr: {
        translation: fr,
      },
    },
    lng: "en", // Default language
    fallbackLng: "en", // Fallback to English if translation is missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    debug: false, // Set to true for development debugging
  });

export default i18n;
