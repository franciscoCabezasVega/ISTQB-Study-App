'use client';

import React from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useTranslation } from '@/lib/useTranslation';
import { apiClient } from '@/lib/api';

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="5" />
    <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

type ThemeOption = 'light' | 'dark';

export function ThemeSelector() {
  const { theme, setTheme } = useUIStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { t } = useTranslation();

  const options: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('common.light'), icon: <SunIcon /> },
    { value: 'dark', label: t('common.dark'), icon: <MoonIcon /> },
  ];

  const handleSetTheme = (value: ThemeOption) => {
    setTheme(value);
    if (isAuthenticated && (value === 'light' || value === 'dark')) {
      apiClient.updateThemePreference(value).catch(() => {/* silent fail */});
    }
  };

  return (
    <div
      className="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1 gap-0.5"
      role="radiogroup"
      aria-label={t('common.theme')}
    >
      {options.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleSetTheme(value)}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          className={`
            relative p-2 rounded-lg transition-all duration-200 cursor-pointer
            ${theme === value
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
            }
          `}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
