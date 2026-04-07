import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@istqb-app/shared';
import { setCachedToken } from '@/lib/api';

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

// Custom storage que usa sessionStorage o localStorage según la preferencia.
// getItem sólo parsea una vez (Zustand serializa/deserializa internamente el valor de retorno).
const customStorage = {
  getItem: (name: string) => {
    // localStorage tiene prioridad si existe y tiene rememberMe: true
    const persistentData = localStorage.getItem(name);
    if (persistentData) {
      try {
        const parsed = JSON.parse(persistentData);
        if (parsed.state?.rememberMe) {
          return persistentData;
        }
      } catch {
        // storage corrupto, continuar con sessionStorage
      }
    }
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      // Sincronizar caché de token con el nuevo valor
      setCachedToken(parsed.state?.accessToken ?? null);
      if (parsed.state?.rememberMe) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch {
      // valor inválido, guardar en sessionStorage como fallback
      sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
    setCachedToken(null);
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
