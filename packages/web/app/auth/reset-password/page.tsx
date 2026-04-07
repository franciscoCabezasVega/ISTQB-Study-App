'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTranslation } from '@/lib/useTranslation';
import { apiClient } from '@/lib/api';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

function isPasswordValid(validation: PasswordValidation): boolean {
  return Object.values(validation).every(Boolean);
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [noToken, setNoToken] = useState(false);

  // Extraer access_token del hash fragment o de sessionStorage (fallback desde page.tsx)
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');

    if (token) {
      setAccessToken(token);
      // Limpiar el hash para no dejar el token expuesto en la URL
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    } else {
      // Intentar recuperar el token desde sessionStorage (redirigido via page.tsx)
      const stored = sessionStorage.getItem('auth:redirect-token');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { accessToken: string; type: string };
          if (parsed.accessToken && parsed.type === 'recovery') {
            setAccessToken(parsed.accessToken);
            sessionStorage.removeItem('auth:redirect-token');
          } else {
            setNoToken(true);
          }
        } catch {
          setNoToken(true);
        }
      } else {
        setNoToken(true);
      }
    }
  }, []);

  // Validar contraseña
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      });
    }
  }, [password]);

  // Verificar que las contraseñas coinciden
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isPasswordValid(passwordValidation)) {
      setError(t('auth.passwordTooWeak'));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      setLoading(false);
      return;
    }

    try {
      await apiClient.resetPassword(accessToken, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err) {
      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401) {
        setNoToken(true);
      } else {
        setError(t('auth.resetPasswordError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (noToken) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center py-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">
            {t('auth.invalidResetLink')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.invalidResetLinkMessage')}
          </p>
          <Link href="/auth/forgot-password">
            <Button variant="primary" size="lg" className="w-full">
              {t('auth.requestNewResetLink')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
            {t('auth.passwordResetSuccess')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.passwordResetSuccessMessage')}
          </p>
          <Link href="/auth/signin">
            <Button variant="primary" size="lg" className="w-full">
              {t('auth.goToSignIn')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center" suppressHydrationWarning>
      <Card className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">
          {t('auth.resetPasswordTitle')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {t('auth.resetPasswordDescription')}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div suppressHydrationWarning>
            <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 pr-12"
                placeholder="••••••••"
                autoComplete="new-password"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          {password && (
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-700 dark:text-gray-300">{t('auth.passwordRequirements')}</p>
              {Object.entries(passwordValidation).map(([key, valid]) => (
                <p key={key} className={valid ? 'text-green-600' : 'text-red-500'}>
                  {valid ? '●' : '○'} {t(`auth.${key === 'minLength' ? 'passwordMinLength' : key === 'hasUppercase' ? 'passwordUppercase' : key === 'hasLowercase' ? 'passwordLowercase' : key === 'hasNumber' ? 'passwordNumber' : 'passwordSpecial'}`)}
                </p>
              ))}
            </div>
          )}

          <div suppressHydrationWarning>
            <label htmlFor="confirmNewPassword" className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmNewPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 pr-12"
                placeholder="••••••••"
                autoComplete="new-password"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-xs mt-1">
                {t('auth.passwordsDoNotMatch')}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || !isPasswordValid(passwordValidation) || !passwordsMatch}
          >
            {loading ? t('auth.resettingPassword') : t('auth.resetPassword')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
