import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@istqb-app/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

// Custom storage que usa sessionStorage o localStorage según la preferencia
const customStorage = {
  getItem: (name: string) => {
    // Intentar primero en localStorage (para sesiones persistentes)
    const persistentData = localStorage.getItem(name);
    if (persistentData) {
      const parsed = JSON.parse(persistentData);
      // Si el usuario eligió recordar sesión, usar localStorage
      if (parsed.state?.rememberMe) {
        return persistentData;
      }
    }
    
    // Si no, intentar en sessionStorage (para sesiones temporales)
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    const parsed = JSON.parse(value);
    // Si rememberMe es true, guardar en localStorage
    if (parsed.state?.rememberMe) {
      localStorage.setItem(name, value);
      // Limpiar sessionStorage si existe
      sessionStorage.removeItem(name);
    } else {
      // Si no, guardar en sessionStorage (sesión temporal)
      sessionStorage.setItem(name, value);
      // Limpiar localStorage si existe
      localStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      rememberMe: false,
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRememberMe: (remember) => set({ rememberMe: remember }),
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, rememberMe: false });
        // Limpiar ambos storages
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          sessionStorage.removeItem('auth-storage');
        }
      },
      initialize: () => set({ isLoading: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
