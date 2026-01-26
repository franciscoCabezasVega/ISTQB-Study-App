'use client';

import React, { useEffect, useMemo } from 'react';
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

  // Calcular si la racha realmente está activa basándose en last_study_date
  const effectiveStreak = useMemo(() => {
    if (!streak) return 0;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const lastStudyDate = new Date(streak.last_study_date);
    lastStudyDate.setHours(0, 0, 0, 0);
    
    const daysSinceLastStudy = Math.floor((now.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Si pasó más de 1 día sin estudiar, la racha se pierde
    if (daysSinceLastStudy > 1) {
      return 0;
    }
    
    return streak.current_streak;
  }, [streak]);

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
    const isStreakBroken = effectiveStreak === 0;
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
        isStreakBroken 
          ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700' 
          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      }`}>
        <span className={`text-2xl ${isStreakBroken ? 'grayscale opacity-50' : ''}`}>🔥</span>
        <span className={`font-bold ${
          isStreakBroken 
            ? 'text-gray-400 dark:text-gray-600' 
            : 'text-orange-600 dark:text-orange-400'
        }`}>{effectiveStreak}</span>
      </div>
    );
  }

  const isStreakBroken = effectiveStreak === 0;
  
  return (
    <div className={`p-4 rounded-lg border ${
      isStreakBroken
        ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700'
        : 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`text-4xl ${isStreakBroken ? 'grayscale opacity-50' : ''}`}>🔥</div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('progress.currentStreak')}</div>
          <div className={`text-2xl font-bold ${
            isStreakBroken 
              ? 'text-gray-400 dark:text-gray-600' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {effectiveStreak} {effectiveStreak === 1 
              ? t('progress.days').slice(0, -1) // Singular: día
              : t('progress.days') // Plural: días
            }
          </div>
          {streak.longest_streak > effectiveStreak && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('progress.longestStreak') || 'Récord'}: {streak.longest_streak} {t('progress.days')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
