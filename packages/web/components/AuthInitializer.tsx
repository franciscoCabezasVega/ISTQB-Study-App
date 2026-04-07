'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const userTheme = useAuthStore((state) => state.user?.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync theme from DB ↔ uiStore
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && userTheme) {
      setTheme(userTheme);
    } else if (!isAuthenticated) {
      setTheme('light');
    }
  }, [isLoading, isAuthenticated, userTheme, setTheme]);

  return <>{children}</>;
}
