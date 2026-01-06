'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useStreakStore } from '@/lib/store/streakStore';
import { useTranslation } from '@/lib/useTranslation';

interface StreakCounterProps {
  compact?: boolean;
}

export function StreakCounter({ compact = false }: StreakCounterProps) {
  const { user } = useAuthStore();
  const { streak, loading, loadStreak } = useStreakStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      loadStreak();
    }
  }, [user, loadStreak]);

  // No mostrar nada si no hay usuario
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        {!compact && <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>}
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <span className="text-2xl">🔥</span>
        <span className="font-bold text-orange-600 dark:text-orange-400">{streak.current_streak}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
      <div className="flex items-center gap-3">
        <div className="text-4xl">🔥</div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('progress.currentStreak')}</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {streak.current_streak} {streak.current_streak === 1 
              ? t('progress.days').slice(0, -1) // Singular: día
              : t('progress.days') // Plural: días
            }
          </div>
          {streak.longest_streak > streak.current_streak && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('progress.longestStreak') || 'Récord'}: {streak.longest_streak} {t('progress.days')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
