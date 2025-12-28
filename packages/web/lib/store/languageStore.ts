import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'es' | 'en';
  setLanguage: (language: 'es' | 'en') => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Store para manejar el idioma de la aplicación
 * Persiste en localStorage como fallback cuando el usuario no está autenticado
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'es',
      _hasHydrated: false,
      setLanguage: (language) => set({ language }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'istqb-language',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
