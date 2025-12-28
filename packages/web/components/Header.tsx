'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from './Button';
import { StreakCounter } from './StreakCounter';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = async () => {
    setShowDropdown(false);
    logout();
    // Usar router de Next.js para una navegación más limpia
    router.push('/auth/signin');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const navLinkClass = (path: string) => {
    return isActive(path)
      ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';
  };
  
  // Verificar si estamos en páginas de autenticación o en home sin login
  const isAuthPage = pathname?.startsWith('/auth/');
  const isHomePage = pathname === '/';
  const shouldHideSignInButton = isAuthPage || (isHomePage && !user);

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            📚 ISTQB Study
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/study" className={navLinkClass('/study')}>
                  {t('nav.study')}
                </Link>
                <Link href="/exam" className={navLinkClass('/exam')}>
                  {t('nav.exam')}
                </Link>
                <Link href="/progress" className={navLinkClass('/progress')}>
                  {t('nav.progress')}
                </Link>
                <Link href="/achievements" className={navLinkClass('/achievements')}>
                  {t('nav.achievements')}
                </Link>
                <StreakCounter compact />
                <LanguageSelector />
                
                {/* Avatar con dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:opacity-80 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.full_name)}
                    </div>
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{user.full_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              router.push('/settings/reminders');
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <span>⚙️</span>
                            <span>{t('nav.settings')}</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <span>🚪</span>
                            <span>{t('common.logout')}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <LanguageSelector />
                {!shouldHideSignInButton && (
                  <Link href="/auth/signin">
                    <Button variant="primary" size="sm">
                      {t('auth.signin')}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
