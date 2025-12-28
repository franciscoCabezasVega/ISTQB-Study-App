import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  sidebarOpen: boolean;
  
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'es' | 'en') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
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
