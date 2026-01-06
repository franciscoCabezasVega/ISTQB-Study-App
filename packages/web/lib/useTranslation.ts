'use client';

import { useLanguageStore } from './store/languageStore';
import { translations } from './i18n.ts';

export function useTranslation() {
  const { language: storeLanguage, _hasHydrated } = useLanguageStore();

  // Durante SSR y antes de que se hidrate, usar siempre 'es'
  // Esto previene errores de hidratación
  const language = typeof window === 'undefined' || !_hasHydrated ? 'es' : storeLanguage;

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    let result = typeof value === 'string' ? value : key;

    // Reemplazar parámetros si existen
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return result;
  };

  return { t, language };
}
