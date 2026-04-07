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
    // o solo #type=signup cuando el token fue movido a sessionStorage por page.tsx
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const typeFromHash = params.get('type');
    const accessToken = params.get('access_token');

    // Limpiar el hash inmediatamente para no dejar tokens expuestos en la URL
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);

    // Intentar leer el tipo desde el hash; si no está, buscar en sessionStorage (fallback de page.tsx)
    let type = typeFromHash;
    if (!type) {
      const stored = sessionStorage.getItem('auth:redirect-token');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { accessToken: string; type: string };
          type = parsed.type;
        } catch {
          // ignorar JSON malformado
        }
      }
    }

    if (type === 'signup' || type === 'email') {
      // Limpiar la entrada de sessionStorage ya consumida
      sessionStorage.removeItem('auth:redirect-token');
      // Email verificado exitosamente
      setStatus('success');
      // Redirigir al signin después de 3 segundos
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } else if (type === 'recovery') {
      // Guardar token en sessionStorage y redirigir a reset-password sin token en URL
      if (accessToken) {
        sessionStorage.setItem(
          'auth:redirect-token',
          JSON.stringify({ accessToken, type: 'recovery' })
        );
        router.push('/auth/reset-password');
      } else {
        setStatus('error');
      }
    } else {
      // Sin tipo reconocido — no asumir éxito para evitar falsos positivos
      setStatus('error');
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
