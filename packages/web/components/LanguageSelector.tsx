'use client';

import React, { useState } from 'react';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useAuthStore } from '@/lib/store/authStore';
import { apiClient } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSelector() {
  const { language, setLanguage: setLanguageStore } = useLanguageStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageChange = async (newLanguage: 'es' | 'en') => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Si está en la página de examen o sesión, redirigir al home
      const isInExamPages = pathname === '/exam' || pathname?.startsWith('/exam/');
      
      if (isInExamPages) {
        console.log('[LANGUAGE] Cambio de idioma detectado en examen. Redirigiendo al home...');
        // Actualizar idioma primero
        setLanguageStore(newLanguage);
        if (user) {
          await apiClient.updateLanguagePreference(newLanguage);
        }
        // Redirigir al home
        router.push('/');
        return;
      }
      
      // Actualizar store local inmediatamente
      setLanguageStore(newLanguage);

      // Si el usuario está autenticado, guardar en BD
      if (user) {
        await apiClient.updateLanguagePreference(newLanguage);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      // Revertir cambio si falla
      setLanguageStore(language);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as 'es' | 'en')}
        disabled={isUpdating}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}

