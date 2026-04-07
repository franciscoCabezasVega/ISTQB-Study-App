'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTranslation } from '@/lib/useTranslation';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      await apiClient.forgotPassword(email);
      setEmailSent(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosErr.response?.status;
      const message = axiosErr.response?.data?.message;
      if (status === 429 || message === 'RATE_LIMIT_EXCEEDED') {
        setError(t('auth.rateLimitError'));
      } else {
        setError(t('auth.forgotPasswordError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center" suppressHydrationWarning>
      <Card className="max-w-md w-full">
        {emailSent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {t('auth.resetEmailSentTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.resetEmailSentMessage')}
            </p>
            <Link href="/auth/signin">
              <Button variant="primary" size="lg" className="w-full">
                {t('auth.goToSignIn')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2 text-center">
              {t('auth.forgotPasswordTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {t('auth.forgotPasswordDescription')}
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="email@example.com"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('auth.sendingResetEmail') : t('auth.sendResetEmail')}
              </Button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
              <Link href="/auth/signin" className="text-blue-600 font-bold">
                {t('auth.backToSignIn')}
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
