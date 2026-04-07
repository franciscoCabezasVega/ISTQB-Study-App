'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';

const SCROLL_THRESHOLD = 300;

export const BackToTopButton: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t('common.backToTop')}
      aria-label={t('common.backToTop')}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-10 h-10 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};
