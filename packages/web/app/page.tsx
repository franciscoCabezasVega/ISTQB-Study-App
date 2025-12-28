'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/lib/store/authStore';
import { useTranslation } from '@/lib/useTranslation';

export default function Home() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4 text-center">{t('home.notLoggedIn.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {t('home.notLoggedIn.description')}
          </p>
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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          {t('home.welcome').replace('{name}', user.full_name)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estudiar */}
        <Card className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4">{t('home.cards.study.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
            {t('home.cards.study.description')}
          </p>
          <Link href="/study">
            <Button variant="primary" size="lg" className="w-full">
              {t('common.start')}
            </Button>
          </Link>
        </Card>

        {/* Examen */}
        <Card className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4">{t('home.cards.exam.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
            {t('home.cards.exam.description')}
          </p>
          <Link href="/exam">
            <Button variant="success" size="lg" className="w-full">
              {t('common.start')}
            </Button>
          </Link>
        </Card>

        {/* Progreso */}
        <Card className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4">{t('home.cards.progress.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
            {t('home.cards.progress.description')}
          </p>
          <Link href="/progress">
            <Button variant="secondary" size="lg" className="w-full">
              {t('common.view')}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
