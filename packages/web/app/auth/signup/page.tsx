'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/lib/store/authStore';
import { useTranslation } from '@/lib/useTranslation';
import { apiClient } from '@/lib/api';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

function getPasswordStrength(validation: PasswordValidation): PasswordStrength {
  const validCount = Object.values(validation).filter(Boolean).length;
  if (validCount === 5) return 'strong';
  if (validCount >= 3) return 'medium';
  return 'weak';
}

function isPasswordValid(validation: PasswordValidation): boolean {
  return Object.values(validation).every(Boolean);
}

export default function SignupPage() {
  const router = useRouter();
  const { user, setUser, setAccessToken } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Validate password on change
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
      setPasswordStrength(getPasswordStrength(validation));
    }
  }, [password]);

  // Check if passwords match
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

    // Validate password strength
    if (!isPasswordValid(passwordValidation)) {
      setError(t('auth.passwordTooWeak'));
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;

    try {
      const { data } = await apiClient.signup(email, password, fullName);
      
      // Guardar el token PRIMERO, luego el usuario
      // Esto asegura que las peticiones subsecuentes tengan el token
      setAccessToken(data.session.access_token);
      setUser(data.user);
      
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('auth.signup')}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.fullName')}
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder={t('auth.fullName')}
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 pr-12"
                placeholder="••••••••"
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
            
            {/* Password strength indicator */}
            <div className="mt-2">
              {password && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('auth.passwordStrength')}:
                    </span>
                    <span className={`text-sm font-semibold ${
                      passwordStrength === 'strong' ? 'text-green-600 dark:text-green-400' :
                      passwordStrength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordStrength === 'strong' ? t('auth.passwordStrengthStrong') :
                       passwordStrength === 'medium' ? t('auth.passwordStrengthMedium') :
                       t('auth.passwordStrengthWeak')}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-red-500' : 
                      passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                      (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 
                      'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  </div>
                </>
              )}
              <div className="text-xs space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.passwordRequirements')}
                </p>
                <div className={`flex items-center gap-1 ${
                  passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{passwordValidation.minLength ? '✓' : '○'}</span>
                  <span>{t('auth.passwordMinLength')}</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  passwordValidation.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{passwordValidation.hasUppercase ? '✓' : '○'}</span>
                  <span>{t('auth.passwordUppercase')}</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  passwordValidation.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{passwordValidation.hasLowercase ? '✓' : '○'}</span>
                  <span>{t('auth.passwordLowercase')}</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                  <span>{t('auth.passwordNumber')}</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  passwordValidation.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{passwordValidation.hasSpecial ? '✓' : '○'}</span>
                  <span>{t('auth.passwordSpecial')}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 pr-12 ${
                  confirmPassword && !passwordsMatch ? 'border-red-500 dark:border-red-500' : ''
                }`}
                placeholder="••••••••"
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
            disabled={loading}
          >
            {loading ? t('auth.signingUp') : t('auth.signup')}
          </Button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link href="/auth/signin" className="text-blue-600 font-bold">
            {t('auth.signinHere')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
