'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Supabase redirige aquí después de verificar el email
    // Los tokens vienen en el hash fragment: #access_token=...&type=signup
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const type = params.get('type');

    if (type === 'signup' || type === 'email') {
      // Email verificado exitosamente
      setStatus('success');
      // Redirigir al signin después de 3 segundos
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } else if (type === 'recovery') {
      // Redirigir a la página de reset password con el token
      const accessToken = params.get('access_token');
      if (accessToken) {
        router.push(`/auth/reset-password#access_token=${accessToken}`);
      } else {
        setStatus('error');
      }
    } else {
      // Si no hay tipo reconocido, podría ser una verificación exitosa sin hash
      // Redirigir al signin
      setStatus('success');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    }
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="max-w-md w-full text-center py-8">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4 animate-spin">⏳</div>
            <h1 className="text-2xl font-bold mb-2">{t('auth.verifying')}</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
              {t('auth.emailVerified')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.emailVerifiedMessage')}
            </p>
            <Link href="/auth/signin">
              <Button variant="primary" size="lg" className="w-full">
                {t('auth.goToSignIn')}
              </Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              {t('auth.verificationError')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.verificationErrorMessage')}
            </p>
            <Link href="/auth/signin">
              <Button variant="primary" size="lg" className="w-full">
                {t('auth.goToSignIn')}
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
