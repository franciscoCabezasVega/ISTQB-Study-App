'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLanguageStore } from './store/languageStore';
import { useAuthStore } from './store/authStore';
import { apiClient } from './api';
import { translations } from './i18n.ts';

const messages = translations;

type Messages = typeof translations.es;

interface I18nContextType {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => Promise<void>;
  t: (key: string) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage: setLanguageStore } = useLanguageStore();
  const { user } = useAuthStore();

  // Cargar idioma del usuario desde BD al iniciar sesión
  useEffect(() => {
    if (user && user.language && user.language !== language) {
      setLanguageStore(user.language);
    }
  }, [user, language, setLanguageStore]);

  const setLanguage = async (lang: 'es' | 'en') => {
    // Actualizar store local inmediatamente
    setLanguageStore(lang);

    // Si el usuario está autenticado, guardar en BD
    if (user) {
      try {
        await apiClient.updateLanguagePreference(lang);
      } catch (error) {
        console.error('Error updating language in database:', error);
      }
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Retornar la key si no se encuentra traducción
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        messages: messages[language],
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
