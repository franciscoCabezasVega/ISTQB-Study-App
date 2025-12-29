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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleLogout = async () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    logout();
    // Usar router de Next.js para una navegación más limpia
    router.push('/auth/signin');
  };

  const handleNavClick = () => {
    setShowMobileMenu(false);
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
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="hidden xs:inline">ISTQB</span>
            <span>Study</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
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

          {/* Mobile Menu Controls */}
          <div className="flex lg:hidden items-center gap-3">
            {user && <StreakCounter compact />}
            <LanguageSelector />
            {user && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
            {!user && !shouldHideSignInButton && (
              <Link href="/auth/signin">
                <Button variant="primary" size="sm">
                  {t('auth.signin')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && user && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/study" 
                className={`px-4 py-3 rounded-lg ${isActive('/study') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={handleNavClick}
              >
                📖 {t('nav.study')}
              </Link>
              <Link 
                href="/exam" 
                className={`px-4 py-3 rounded-lg ${isActive('/exam') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={handleNavClick}
              >
                🎯 {t('nav.exam')}
              </Link>
              <Link 
                href="/progress" 
                className={`px-4 py-3 rounded-lg ${isActive('/progress') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={handleNavClick}
              >
                📊 {t('nav.progress')}
              </Link>
              <Link 
                href="/achievements" 
                className={`px-4 py-3 rounded-lg ${isActive('/achievements') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={handleNavClick}
              >
                🏆 {t('nav.achievements')}
              </Link>
              
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user.full_name}</p>
                  <p className="text-xs">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    router.push('/settings/reminders');
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span>⚙️</span>
                  <span>{t('nav.settings')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
