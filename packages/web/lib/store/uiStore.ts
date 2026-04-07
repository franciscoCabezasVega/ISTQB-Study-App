import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface UIState {
  theme: ThemeMode;
  language: 'es' | 'en';
  sidebarOpen: boolean;
  
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: 'es' | 'en') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light' as ThemeMode,
      language: 'es',
      sidebarOpen: true,

      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'ui-storage',
    }
  )
);
