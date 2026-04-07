'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CardSkeleton } from '@/components/Skeleton';
import { useAuthStore } from '@/lib/store/authStore';
import { useTranslation } from '@/lib/useTranslation';
import { useDeferredLoading } from '@/lib/hooks/useTimeSlicing';

export default function Home() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const shouldLoadCards = useDeferredLoading(50);
  const router = useRouter();

  // Red de seguridad: Supabase puede redirigir el token de recuperación
  // al Site URL en vez del redirectTo si la URL no está en la whitelist del dashboard.
  // En ese caso interceptamos el hash aquí y redirigimos al flujo correcto.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const accessToken = params.get('access_token');

    if (!accessToken) return;

    // Extraer el token sensible y eliminarlo inmediatamente del hash
    // para que no quede expuesto en el historial del navegador ni a otros scripts.
    sessionStorage.setItem(
      'auth:redirect-token',
      JSON.stringify({ accessToken, type })
    );
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);

    if (type === 'recovery') {
      router.replace('/auth/reset-password');
    } else if (type === 'signup' || type === 'email') {
      // Preservar el tipo en el hash para que /auth/callback pueda leerlo
      // (el token ya está guardado en sessionStorage y no viaja en la URL)
      router.replace(`/auth/callback#type=${encodeURIComponent(type)}`);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full animate-scale-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl font-bold mb-3">{t('home.notLoggedIn.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('home.notLoggedIn.description')}
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/auth/signup" className="block">
              <Button variant="primary" size="lg" className="w-full">
                {t('home.notLoggedIn.signup')}
              </Button>
            </Link>
            <Link href="/auth/signin" className="block">
              <Button variant="secondary" size="lg" className="w-full">
                {t('home.notLoggedIn.signin')}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
          {t('home.welcome').replace('{name}', user.full_name)}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {!shouldLoadCards ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Estudiar */}
            <Card className="flex flex-col animate-fade-in-up stagger-1">
              <h2 className="text-2xl font-bold mb-4">{t('home.cards.study.title')}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {t('home.cards.study.description')}
              </p>
              <Link href="/study">
                <Button variant="primary" size="lg" className="w-full">
                  {t('common.start')}
                </Button>
              </Link>
            </Card>

            {/* Examen */}
            <Card className="flex flex-col animate-fade-in-up stagger-2">
              <h2 className="text-2xl font-bold mb-4">{t('home.cards.exam.title')}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {t('home.cards.exam.description')}
              </p>
              <Link href="/exam">
                <Button variant="success" size="lg" className="w-full">
                  {t('common.start')}
                </Button>
              </Link>
            </Card>

            {/* Progreso */}
            <Card className="flex flex-col animate-fade-in-up stagger-3">
              <h2 className="text-2xl font-bold mb-4">{t('home.cards.progress.title')}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {t('home.cards.progress.description')}
              </p>
              <Link href="/progress">
                <Button variant="secondary" size="lg" className="w-full">
                  {t('common.view')}
                </Button>
              </Link>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
