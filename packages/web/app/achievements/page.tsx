'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/Card';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Button } from '@/components/Button';
import { AchievementSkeleton } from '@/components/Skeleton';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { Achievement, UserAchievement } from '@istqb-app/shared';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';

export default function AchievementsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadAchievements = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener todos los logros en el idioma del usuario
      const allResponse = await apiClient.getAllAchievements(language);
      const allAch = allResponse.data.data;

      // Obtener logros del usuario
      const userResponse = await apiClient.getUserAchievements();
      const userAch = userResponse.data.data;

      setAllAchievements(allAch || []);
      setUserAchievements(userAch || []);
    } catch (error: unknown) {
      console.error('Error loading achievements:', error);
      setError((error as Error).message || 'Error loading achievements');
    } finally {
      setLoading(false);
    }
  }, [user, language]);

  // Efecto para cargar los logros cuando cambia el idioma
  useEffect(() => {
    if (!authLoading && user) {
      hasLoadedRef.current = false; // Resetear para permitir recarga
      loadAchievements();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, language, loadAchievements]);



  const isUnlocked = (achievementId: string): UserAchievement | undefined => {
    return userAchievements.find((ua) => ua.achievement_id === achievementId);
  };

  const unlockedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Ordenar logros: desbloqueados primero (del más antiguo al más nuevo), luego bloqueados
  const sortedAchievements = [...allAchievements].sort((a, b) => {
    const unlockedA = isUnlocked(a.id);
    const unlockedB = isUnlocked(b.id);

    // Si ambos están desbloqueados, ordenar por fecha (más antiguo primero)
    if (unlockedA && unlockedB) {
      return new Date(unlockedA.unlocked_at).getTime() - new Date(unlockedB.unlocked_at).getTime();
    }

    // Si solo A está desbloqueado, va primero
    if (unlockedA) return -1;

    // Si solo B está desbloqueado, va primero
    if (unlockedB) return 1;

    // Si ninguno está desbloqueado, mantener el orden original
    return 0;
  });

  // Mostrar loading mientras se inicializa la autenticación
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🏆 {t('achievements.title')}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AchievementSkeleton />
          <AchievementSkeleton />
          <AchievementSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-400" suppressHydrationWarning>
            {t('auth.pleaseSignIn')} <Link href="/auth/signin" className="text-blue-600 dark:text-blue-400 underline">{t('auth.signin')}</Link> {t('achievements.toViewYourAchievements')}.
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => {
              hasLoadedRef.current = false;
              loadAchievements();
            }}>{t('common.retry') || 'Retry'}</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🏆 {t('achievements.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('achievements.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AchievementSkeleton />
          <AchievementSkeleton />
          <AchievementSkeleton />
          <AchievementSkeleton />
          <AchievementSkeleton />
          <AchievementSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🏆 {t('achievements.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('achievements.unlockedCount', { unlocked: unlockedCount, total: totalCount })}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAchievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);
          return (
            <Card key={achievement.id} className={unlocked ? 'ring-2 ring-yellow-400' : ''}>
              <div className="flex flex-col items-center text-center space-y-4">
                <AchievementBadge
                  achievement={achievement}
                  unlocked={!!unlocked}
                  unlockedAt={unlocked?.unlocked_at}
                  size="lg"
                />
              </div>
            </Card>
          );
        })}
      </div>

      {sortedAchievements.length === 0 && (
        <Card>
          <p className="text-center text-gray-600 dark:text-gray-400">
            No hay logros disponibles aún. Los logros se añadirán próximamente.
          </p>
        </Card>
      )}
    </div>
  );
}
