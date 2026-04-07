'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';

      // Actualizar todos los meta[name="theme-color"] para cubrir tanto
      // los que tienen media query como los que no
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.setAttribute('content', isDark ? '#111118' : '#fafaf9');
      });
    };

    applyTheme(theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
