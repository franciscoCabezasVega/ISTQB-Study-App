'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = isDark ? 'dark' : 'light';

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', isDark ? '#111118' : '#fafaf9');
      }
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    applyTheme(theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
