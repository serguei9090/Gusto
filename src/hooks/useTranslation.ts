import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { Language } from '@/lib/i18n';

/**
 * Custom hook for translations with type safety
 * Usage: const { t } = useTranslation();
 * Then: t('common.actions.save') => "Save" or "Guardar"
 */
export function useTranslation() {
    const { t, i18n } = useI18nTranslation();

    const changeLanguage = (lang: Language) => {
        i18n.changeLanguage(lang);
        // Persist language preference
        localStorage.setItem('preferredLanguage', lang);
    };

    const currentLanguage = i18n.language as Language;

    return {
        t,
        changeLanguage,
        currentLanguage,
    };
}

/**
 * Get translated text without hooks (for use outside components)
 */
export function translate(key: string, options?: any) {
    const { t } = useI18nTranslation();
    return t(key, options);
}
